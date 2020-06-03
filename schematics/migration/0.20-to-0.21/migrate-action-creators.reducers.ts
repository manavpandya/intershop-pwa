import { tsquery } from '@phenomnomnominal/tsquery';
import { CaseClause, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

import { ActionCreatorsActionsMorpher } from './migrate-action-creators.actions';
import { createActionTypes, getReducerFunction } from './morph-helpers';

// tslint:disable: no-console

export class ActionCreatorsReducerMorpher {
  switchStatements: {
    identifier: string;
    dependsOnAction: boolean;
    dependsOnState: boolean;
    statements: string;
    previousIdentifiers: string[];
  }[];
  dependencies: string[] = [];
  constructor(public reducerFile: SourceFile, private actionsMorph: ActionCreatorsActionsMorpher) {}

  migrateReducer() {
    if (!this.reducerFile) {
      return;
    }
    console.log('migrating', this.reducerFile.getFilePath());
    if (!this.checkUmigratedFile()) {
      return;
    }
    if (!getReducerFunction(this.reducerFile)) {
      return;
    }
    console.log('replacing reducers...');
    this.addImports();
    this.declareNewReducer();
    this.updateFeatureReducer();
    this.removeOldReducer();
    this.reducerFile.fixMissingImports();
    if (this.dependencies.length > 0) {
      console.log(`  store depends on foreign actions: `);
      this.dependencies.forEach(dep => console.log(`    ${dep}`));
      console.log('  please migrate the corresponding stores');
    }
  }
  /**
   * add required imports to prevent problems with automatic adding
   */
  private addImports() {
    this.reducerFile.addImportDeclaration({
      moduleSpecifier: '@ngrx/store',
      namedImports: ['on'],
    });
  }

  /**
   * declare new reducer function created with new createReducer factory
   */
  private declareNewReducer() {
    this.extractReducerContents();

    // create new reducer function
    const reducer = this.reducerFile.addVariableStatement({
      isExported: true,
      isDefaultExport: false,
      hasDeclareKeyword: false,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: getReducerFunction(this.reducerFile).getName(),
          initializer: 'createReducer()',
          type: undefined,
          hasExclamationToken: false,
        },
      ],
    });

    // add first reducer argument
    const createReducerFunction = reducer.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
    createReducerFunction.addArgument('initialState');

    // for each switch case, add a new on()-function
    this.switchStatements.forEach(clause => {
      // name of the actionCreator function
      const actionTypes = createActionTypes(clause.identifier, clause.previousIdentifiers);
      actionTypes.forEach(actionTypesString => {
        let arrowFunction;
        if (clause.dependsOnAction && clause.dependsOnState) {
          arrowFunction = `(state, action) => ${clause.statements}`;
        } else if (!clause.dependsOnAction && clause.dependsOnState) {
          arrowFunction = `state => ${clause.statements}`;
        } else if (clause.dependsOnAction && !clause.dependsOnState) {
          arrowFunction = `(_, action) => ${clause.statements}`;
        } else {
          arrowFunction = `() => ${clause.statements}`;
        }
        createReducerFunction.addArgument(`on(${actionTypesString}, ${arrowFunction})`);
      });
    });
  }

  /**
   * update reducer function to use the newly constructed version using createReducer
   */
  private updateFeatureReducer() {
    getReducerFunction(this.reducerFile).getParameter('action').remove();
    getReducerFunction(this.reducerFile).addParameter({ name: 'action', type: 'Action' });
    getReducerFunction(this.reducerFile)
      .getFirstChildByKindOrThrow(SyntaxKind.Block)
      .getStatements()
      .forEach(statement => statement.remove());
    getReducerFunction(this.reducerFile).setBodyText('return reducer(state,action)');
  }

  /**
   * extract information from the old reducer switch statement
   */
  private extractReducerContents() {
    // retrieve reducer logic from old reducer
    this.switchStatements = [];
    let previousIdentifiers: string[] = [];

    if (getReducerFunction(this.reducerFile).getDescendantsOfKind(SyntaxKind.SwitchStatement).length === 0) {
      throw new Error('this reducer does not include a switch statement. Please migrate manually');
    }
    // iterate over reducer switch cases and store info
    getReducerFunction(this.reducerFile)
      .getFirstDescendantByKind(SyntaxKind.CaseBlock)
      .getClauses()
      .filter(clause => clause.getKind() === SyntaxKind.CaseClause)
      .forEach((clause: CaseClause) => {
        if (
          this.actionsMorph.actionTypes &&
          !this.actionsMorph.actionTypes[clause.getExpression().getText().split('.')[1]]
        ) {
          this.dependencies.push(clause.getExpression().getText());
        }
        // store empty clauses for later use and continue
        if (clause.getStatements().length === 0) {
          previousIdentifiers.push(clause.getExpression().getText());
          return;
        }

        const clauseBody = clause.getStatements()[0];

        // push information about switch statement to array
        this.switchStatements.push({
          identifier: clause.getExpression().getText(),
          dependsOnAction: !!tsquery(clauseBody.compilerNode, 'Identifier[name=action]').length,
          dependsOnState: !!tsquery(clauseBody.compilerNode, 'Identifier[name=state]').length,
          statements: clauseBody.getKind() === SyntaxKind.Block ? clauseBody.getText() : `{${clauseBody.getText()}}`,
          previousIdentifiers: [...previousIdentifiers],
        });
        previousIdentifiers = [];
      });
  }

  private checkUmigratedFile(): boolean {
    if (this.reducerFile.getText().includes('createReducer')) {
      console.log('this file is already migrated, skipping...');
      return false;
    } else {
      return true;
    }
  }

  private removeOldReducer() {
    const oldFunc = getReducerFunction(this.reducerFile);
    oldFunc.remove();
  }
}
