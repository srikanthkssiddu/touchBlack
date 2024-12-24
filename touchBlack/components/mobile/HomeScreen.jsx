import React, { useState, useContext, useMemo, useCallback } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Modal,
  Platform,
} from "react-native";
import { TodoProvider, TodoContext } from "../../subComponents/todoProvider";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const useTodos = () => {
  return useContext(TodoContext);
};
const isWeb = Platform.OS === "web";
const TodoList = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState([]);
  const { todos, addTodo, deleteTodo, editTodo, markAsCompleted } = useTodos();

  const getFilteredAndSortedTodos = () => {
    let filteredTodos = todos;

    if (filterStatus !== "all") {
      filteredTodos = filteredTodos.filter((todo) => {
        if (filterStatus === "completed") {
          return todo.completed === true;
        }
        return todo.completed === false;
      });
    }
    if (sortBy === "date") {
      filteredTodos = [...filteredTodos].sort((a, b) => {
        const parseDate = (dateString) => {
          const [day, month, year] = dateString.split("/").map(Number);
          return new Date(year, month - 1, day);
        };
        const dateA = parseDate(a.date).getTime();
        const dateB = parseDate(b.date).getTime();

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === "title") {
      filteredTodos = filteredTodos.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (titleA < titleB) return sortOrder === "asc" ? -1 : 1;
        if (titleA > titleB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filteredTodos;
  };
  const filteredAndSortedTodos = useMemo(() => {
    return getFilteredAndSortedTodos();
  }, [todos, filterStatus, sortBy, sortOrder]);

  const handleAddTodo = useCallback(() => {
    addTodo(title, description);
    setTitle("");
    setDescription("");
    setIsDropdownVisible(false);
  }, [addTodo, title, description]);

  const handleEditTodo = useCallback(() => {
    if (editingTodoId) {
      editTodo(editingTodoId, title, description);
      setTitle("");
      setDescription("");
      setEditingTodoId(null);
      setIsDropdownVisible(false);
      setIsEditMode(false);
    }
  }, [editTodo, editingTodoId, title, description]);

  const toggleSelection = useCallback(
    (id) => {
      if (selectedTodos.includes(id)) {
        setSelectedTodos(selectedTodos.filter((todoId) => todoId !== id));
      } else {
        setSelectedTodos([...selectedTodos, id]);
      }
    },
    [selectedTodos]
  );

  const handleMarkAsCompleted = useCallback(() => {
    markAsCompleted(selectedTodos);
    setSelectedTodos([]);
    setIsSelectionMode(false);
  }, [markAsCompleted, selectedTodos]);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTodo(id) },
      ]
    );
  };
  const handleDeleteWeb = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (isConfirmed) {
      deleteTodo(id);
    } else {
      console.log("Logout cancelled");
    }
  };

  const handleEdit = useCallback((id, currentTitle, currentDescription) => {
    setTitle(currentTitle);
    setDescription(currentDescription);
    setEditingTodoId(id);
    setIsEditMode(true);
    setIsDropdownVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    setIsDropdownVisible(false);
    setDescription("");
    setTitle("");
  }, []);

  const toggleSortModal = useCallback(
    () => setSortModalVisible(!sortModalVisible),
    [sortModalVisible]
  );
  const toggleFilterModal = useCallback(
    () => setFilterModalVisible(!filterModalVisible),
    [filterModalVisible]
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.navigate("Login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleLogoutWeb = async () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");

    if (isConfirmed) {
      try {
        sessionStorage.removeItem("phoneNumber");
        sessionStorage.removeItem("password");

        navigation.navigate("Login");
      } catch (error) {
        console.error("Error during logout:", error);
        alert("Failed to logout.");
      }
    } else {
      console.log("Logout cancelled");
    }
  };

  const renderTodo = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => setIsSelectionMode(true)}
      onPress={() => (isSelectionMode ? toggleSelection(item.id) : null)}
      style={[
        styles.todoItem,
        selectedTodos.includes(item.id) && styles.todoItemSelected,
      ]}
    >
      {isSelectionMode && (
        <View style={styles.checkboxContainer}>
          <View
            style={[
              styles.checkboxOuter,
              selectedTodos.includes(item.id) && styles.checkboxOuterSelected,
            ]}
          >
            {selectedTodos.includes(item.id) && (
              <View style={styles.checkboxInner} />
            )}
          </View>
        </View>
      )}

      <View style={styles.todoText}>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDescription}>{item.description}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleEdit(item.id, item.title, item.description)}
        >
          <Icon name="edit" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            isWeb ? handleDeleteWeb(item.id) : handleDelete(item.id)
          }
        >
          <Icon
            name="delete"
            size={24}
            color="000"
            style={{ marginLeft: 15 }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No tasks available. Add your first task!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar animated={true} />
      <View style={styles.heading}>
        <Text style={styles.title}>To-Do List</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={isWeb ? handleLogoutWeb : handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.addTodoContainer}>
        <TouchableOpacity
          style={styles.addTodoButton}
          onPress={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          <Text style={styles.addTodoButtonText}>Add Todo</Text>
          <Icon name="add" size={25} color="#000" />
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            style={styles.addTodoButton}
            onPress={() => toggleSortModal()}
          >
            <Text style={styles.addTodoButtonText}>Sort </Text>
            <Icon name="sort" size={25} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addTodoButton}
            onPress={() => toggleFilterModal()}
          >
            <Text style={styles.addTodoButtonText}>Filter</Text>
            <Icon name="filter-alt" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={toggleSortModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Tasks By</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                sortBy === "date" && styles.selectedButton,
              ]}
              onPress={() => {
                setSortBy("date");
                setSortOrder("asc");
                toggleSortModal();
              }}
            >
              <Text style={styles.modalButtonText}>Creation Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                sortBy === "title" && styles.selectedButton,
              ]}
              onPress={() => {
                setSortBy("title");
                toggleSortModal();
              }}
            >
              <Text style={styles.modalButtonText}>Title (A-Z)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={toggleSortModal}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Tasks By</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                filterStatus === "all" && styles.selectedButton,
              ]}
              onPress={() => {
                setFilterStatus("all");
                toggleFilterModal();
              }}
            >
              <Text style={styles.modalButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                filterStatus === "pending" && styles.selectedButton,
              ]}
              onPress={() => {
                setFilterStatus("pending");
                toggleFilterModal();
              }}
            >
              <Text style={styles.modalButtonText}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                filterStatus === "completed" && styles.selectedButton,
              ]}
              onPress={() => {
                setFilterStatus("completed");
                toggleFilterModal();
              }}
            >
              <Text style={styles.modalButtonText}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.layout}>
        {isDropdownVisible && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View style={styles.cancelButton}>
              <TouchableOpacity style={styles.addButton} onPress={handleCancel}>
                <Text style={styles.addButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={isEditMode ? handleEditTodo : handleAddTodo}
              >
                <Text style={styles.addButtonText}>
                  {isEditMode ? "Save" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={filteredAndSortedTodos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTodo}
          contentContainerStyle={{
            marginLeft: Platform.OS === "web" && isDropdownVisible ? 130 : 0,
          }}
          ListEmptyComponent={renderEmpty}
        />
      </View>
      {isSelectionMode && (
        <View style={styles.markContainer}>
          <TouchableOpacity
            style={styles.markButton}
            onPress={() => setIsSelectionMode(false)}
          >
            <Text style={styles.markButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.markButton}
            onPress={handleMarkAsCompleted}
          >
            <Text style={styles.markButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const HomeScreen = () => {
  return (
    <TodoProvider>
      <TodoList />
    </TodoProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    alignItems: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: isWeb ? 125 : 20,
    paddingVertical: isWeb ? 50 : 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  layout: {
    flex: 1,

    flexDirection: isWeb ? "row" : "column",
  },
  flatlistContainer: {},
  checkboxContainer: {
    padding: 5,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOuterSelected: {
    borderColor: "#000",
    backgroundColor: "transparent",
  },
  checkboxInner: {
    width: 14,
    height: 14,
    backgroundColor: "#000000",
    borderRadius: 7,
  },
  markContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 10,
    width: isWeb ? width * 0.35 : width * 0.9,
    marginBottom: 10,
  },
  markButton: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  markButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "80%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    borderRadius: 5,
    color: "#333",
    fontSize: 16,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    letterSpacing: 2,
    marginTop: 10,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#1c1c1c",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskText: {
    color: "#fff",
    fontSize: 18,
    flex: 1,
  },
  editText: {
    color: "#ccc",
    marginRight: 10,
  },
  deleteText: {
    color: "#e74c3c",
  },
  logoutButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    height: 30,
    borderColor: "#fff",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  header: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
    width: isWeb ? width * 0.4 : width * 0.9,
    borderColor: "#ffffff",
    padding: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  cancelButton: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#fff",
    padding: 7.5,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#000",
    fontWeight: "bold",
    paddingHorizontal: 15,
  },
  list: {
    marginTop: 20,
  },
  todoCard: {
    flexDirection: "row",
  },
  todoItem: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 15,
    marginBottom: 10,
    width: isWeb ? width * 0.35 : width * 0.9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  todoDescription: {
    fontSize: 12.5,
    color: "#333",
    marginTop: 5,
    marginLeft: 10,
  },
  todoText: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    marginRight: 7.5,
  },
  addTodoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  addTodoButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 6.5,
    paddingVertical: 1,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  addTodoButtonText: {
    color: "#000",
    fontWeight: "bold",
    marginLeft: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333",
    marginVertical: 10,
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1000,
    bottom: 150,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 10,
    paddingHorizontal: 15,
    width: isWeb ? width * 0.125 : width * 0.35,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#808080",
    marginBottom: 2,
  },
  modalButton: {
    paddingVertical: 7.5,
    paddingHorizontal: 1,
    backgroundColor: "#fff",
    marginVertical: 2,
    width: "100%",
    alignItems: "center",
  },
  selectedButton: {
    borderWidth: 1,
    borderColor: "000",
  },
  modalButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  selectionText: {
    fontSize: 14,

    color: "#555",
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
});

export default HomeScreen;
