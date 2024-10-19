/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useMemo } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

type Filters = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<Filters>('all');

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(error => setCurrentError(error.message))
      .finally(() => setTimeout(() => setCurrentError(null), 3000));
  }, []);

  useEffect(() => {
    setFilteredTodos(todos);
  }, [todos]);

  const onFilterChange = (filter: Filters) => {
    setCurrentFilter(filter);

    switch (filter) {
      case 'all':
        setFilteredTodos(todos);
        break;
      case 'active':
        setFilteredTodos(todos.filter(todo => !todo.completed));
        break;
      case 'completed':
        setFilteredTodos(todos.filter(todo => todo.completed));
        break;
    }
  };

  const isAllCompleted = useMemo(() => {
    return filteredTodos.every(todo => todo.completed);
  }, [filteredTodos]);

  const completedCount = useMemo(() => {
    return todos.reduce((acc, todo) => (todo.completed ? acc : acc + 1), 0);
  }, [todos]);

  // console.log(todos);

  if (!USER_ID) {
    return <UserWarning />;
  }

  if (!filteredTodos) {
    return <div>Loading...</div>;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          {filteredTodos.length > 0 && (
            <button
              type="button"
              className={classNames('button', { active: isAllCompleted })}
              data-cy="ToggleAllButton"
            />
          )}

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos.map(todo => (
            <div
              data-cy="Todo"
              key={todo.id}
              className={classNames('todo', { completed: todo.completed })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {completedCount} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: currentFilter === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={() => onFilterChange('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: currentFilter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => onFilterChange('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: currentFilter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => onFilterChange('completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            {completedCount > 0 && (
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: currentError === null,
          },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {/* show only one message at a time */}
        {currentError === null || 'Unable to load todos'}
        <br />
        {/* Title should not be empty */}
        <br />
        {/* Unable to add a todo */}
        <br />
        {/* Unable to delete a todo */}
        <br />
        {/* Unable to update a todo */}
      </div>
    </div>
  );
};
