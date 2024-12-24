// TodoContext.js

import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

export const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([
    {
      id: "1",
      title: "Learn React",
      description: "Study React fundamentals and hooks.",
      completed: false,
      dueDate: "2024-12-25",
      date: "24/12/2024",
    },
    {
      id: "2",
      title: "Build a project",
      description: "Create a To-Do list app using React Native.",
      completed: true,
      dueDate: "2024-12-20",
      date: "25/12/2024",
    },
    {
      id: "3",
      title: "Optimize performance",
      description: "Improve performance of the To-Do list app.",
      completed: false,
      dueDate: "2024-12-30",
      date: "26/12/2024",
    },
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
