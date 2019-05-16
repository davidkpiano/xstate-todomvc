import { Machine, actions, spawn } from "xstate";
import uuid from "uuid-v4";
import { todoMachine } from "./todoMachine";
const { assign } = actions;

const createTodo = title => {
  return {
    id: uuid(),
    title: title,
    completed: false
  };
};

export const todosMachine = Machine({
  id: "todos",
  context: {
    todo: "", // new todo
    todos: []
  },
  initial: "all",
  states: {
    all: {},
    active: {},
    completed: {}
  },
  on: {
    "NEWTODO.CHANGE": {
      actions: assign({
        todo: (ctx, e) => e.value
      })
    },
    "NEWTODO.COMMIT": {
      actions: [
        assign({
          todo: "", // clear todo
          todos: (ctx, e) =>
            ctx.todos.concat(
              spawn(todoMachine.withContext(createTodo(e.value.trim())))
            )
        }),
        "persist"
      ],
      cond: (ctx, e) => e.value.trim().length
    },
    "TODO.COMMIT": {
      actions: [
        assign({
          todos: (ctx, e) =>
            ctx.todos.map(todo => (todo.id === e.todo.id ? e.todo : todo))
        }),
        "persist"
      ]
    },
    "TODO.DELETE": {
      actions: assign({
        todos: (ctx, e) => {
          return ctx.todos.filter(todo => todo.id !== e.id);
        }
      })
    },
    "SHOW.all": ".all",
    "SHOW.active": ".active",
    "SHOW.completed": ".completed",
    "MARK.completed": {
      actions: assign({
        todos: ctx => ctx.todos.map(todo => ({ ...todo, completed: true }))
      })
    },
    "MARK.active": {
      actions: assign({
        todos: ctx => ctx.todos.map(todo => ({ ...todo, completed: false }))
      })
    },
    CLEAR_COMPLETED: {
      actions: assign({
        todos: ctx => ctx.todos.filter(todo => !todo.completed)
      })
    }
  }
});
