// TodoContext.js

import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

export const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([
  
  ]);

  const validateTodo = (title, description) => {
    if (title.length === 0 || description.length === 0) {
      Alert.alert("Error", "Both fields are required!");
      return false;
    }

    if (title.length > 30) {
      Alert.alert("Error", "Title must be less than 30 characters.");
      return false;
    }

    if (description.length > 200) {
      Alert.alert("Error", "Description must be less than 200 characters.");
      return false;
    }

    return true;
  };

  const addTodo = (title, description) => {
    if (!validateTodo(title, description)) {
      return false;
    }

    const currentDate = new Date().toLocaleDateString();

    const newTodo = {
      id: Date.now().toString(),
      title,
      description,
      date: currentDate,
      completed: false,
    };

    setTodos([newTodo, ...todos]);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id, newTitle, newDescription) => {
    if (!validateTodo(newTitle, newDescription)) {
      return false;
    }

    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, title: newTitle, description: newDescription }
          : todo
      )
    );
  };
  const markAsCompleted = (selectedIds) => {
    setTodos(
      todos.map((todo) =>
        selectedIds.includes(todo.id) ? { ...todo, completed: true } : todo
      )
    );
  };
  return (
    <TodoContext.Provider
      value={{ todos, addTodo, deleteTodo, editTodo, markAsCompleted }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => useContext(TodoContext);
