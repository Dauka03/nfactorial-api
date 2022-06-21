import {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = "https://api.todoist.com/rest/v1/tasks";

/*
* Plan:
*   1. Define backend url
*   2. Get items and show them +
*   3. Toggle item done +
*   4. Handle item add +
*   5. Delete +
*   6. Filter
*
* */

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [items, setItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handleAddItem = () => {
    axios.post(`${BACKEND_URL}`,
    {
      content:itemToAdd,
      completed: false,
    },
    {
      headers:{
        "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717",
        "Content-Type": "application/json",
      
      }  
    }
    ).then((response) => {
        setItems([ ...items, response.data])
    })
    setItemToAdd("");
  };


  const toggleItemDone = (item) => {
    const {id, completed} = item;

    console.log(item);
    if (item.completed_date) {
      console.log('REOPENING');
      axios.post(`${BACKEND_URL}/${item.task_id}/reopen`,{},
      {
        headers:{
          "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717"
        }
      }).then((response) => {
          setItems(items.map((item) => {
              if (item.id === id) {
                  return {
                      ...item,
                      completed: !completed
                  }
              }
              return item
          }))

      })
    }
    // если хотим reopen => нужно искать в папке completed
    // если хотим close => нужно искать в папке active
    else {
      console.log('CLOSING');
      axios.post(`${BACKEND_URL}/${id}/close`,
      {
        completed:!completed
      },
      {
        headers:{
          "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717"
        },
      }).then((response) => {
        setItems(items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    completed: !completed
                }
            }
            return item
        }))

    })
    }
  };

  // N => map => N
    // N => filter => 0...N
  const handleItemDelete = (id) => {
      axios.delete(`${BACKEND_URL}/${id}`,
      {
        headers:{
          "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717"
        }
      }).then(() => {
          console.log('Было:',items)
          const newItems = items.filter((item) => {
              return id !== item.id
          })
          console.log('Осталось:',newItems)
          setItems(newItems)
      })
  };
  
    
    
    const handleCompleteItems = () => {
      axios.get(`https://api.todoist.com/sync/v8/completed/get_all`,{
        headers: {
          "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717"
        }
      }).then((response) => {
        setItems(response.data.items)
      })
    };

    

  useEffect(() => {
      axios.get(`${BACKEND_URL}`,{
        headers: {
          "Authorization": "Bearer dd4460e13c628034a1244e7c9c0d9b3b7f12b717"
        }
      }).then((response) => {
          setItems(response.data);
      })
  }, [searchValue])



  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
         <div className="btn-group">
            <button
              onClick={() => handleCompleteItems()}
              type="button"
              className={`btn btn-info`}
            >
              completed
            </button>
        </div>
      </div>


      {/* List-group */}
      <ul className="list-group todo-list">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item${item.completed_date ? " done" : ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item.id)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <div>No todos🤤</div>
        )}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;
