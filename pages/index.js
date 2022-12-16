import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import Modal from "react-modal";
import React, { useEffect, useState } from "react";
import styles from "../styles/userData.module.css";

export default function () {
  let [errorMsg, setErrorMsg] = useState(" ");
  let [uploadData, setUploadData] = useState();
  let [fetchedData, setFetchedData] = useState();
  let [loading, setLoading] = useState("d-none");
  let [Popup, setPopUp] = useState(false);
  let [event, setEvent] = useState("");
  let [eventsList, setEventsList] = useState()

  let getEventLists = async() => {
    let response = await fetch("http://localhost:1337/api/event-lists")
    let result = await response.json()
    setEventsList(result.data)
  }
  let getTheData = async () => {
    setLoading("d-flex");
    let response = await fetch("http://localhost:1337/api/emailvalids");
    let result = await response.json();
    //console.log(result)
    setFetchedData(result.data);
    setLoading("d-none");
    //console.log(fetchedData);
  };

  let fetchData = async (newData) => {
    setLoading("d-flex");
    let response = await fetch("http://localhost:1337/api/emailvalids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          serialnum: newData[0],
          name: newData[1],
          email: newData[2],
          status: newData[3],
        },
      }),
    });
    let result = await response.status;
    setLoading("d-none");
    getTheData();
    //console.log(result);
  };

  let deleteHandler = async (item) => {
    let response = await fetch(
      `http://localhost:1337/api/emailvalids/${item.id}`,
      {
        method: "DELETE",
      }
    );
    //console.log(await response.status);
    getTheData();
  };

  let changeHandler = (e) => {
    if (
      e.target.value.slice(e.target.value.length - 4, e.target.value.length) ===
      ".csv"
    ) {
      setErrorMsg("");
      const [file] = e.target.files;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        setUploadData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      setErrorMsg("upload a Proper CSV file");
    }
  };

  let submitHandler = (e) => {
    e.preventDefault();
    if (errorMsg === "") {
      //console.log(uploadData);

      uploadData !== undefined &&
        uploadData.map((item) => {
          let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (item.length < 4) {
            if (item[2].match(mailformat) !== null) {
              fetchData([...item, "valid"]);
            } else {
              fetchData([...item, "invalid"]);
            }
          }
        });
    } else {
      setErrorMsg("upload a Proper CSV file");
    }
  };

  let PostEvent = async () => {
    setLoading("d-flex");
    let response = await fetch("http://localhost:1337/api/event-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          eventname: event,
        },
      }),
    });
    let result = await response.status;
    setLoading("d-none");
    setEvent("");
  };

  useEffect(()=>{
    getTheData()
  },[])

  
  return (
    <center className={styles.mainContainer}>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="d-flex">
          <select placeholder="select one" onClick={() => getEventLists()}>
            <option></option>
            {eventsList !== undefined && eventsList.map((item) => {
              return(
                <option key={item.id} value={item.attributes.id}>{item.attributes.eventname}{item.attributes.id}</option>
              )
            })}
          </select>
          <div>
            <button
              className="btn btn-outline-light"
              onClick={() => setPopUp(true)}
            >
              Create List
            </button>
          </div>
        </div>
        <form>
          <input type="file" onChange={changeHandler} />
          <input type="submit" value="upload" onClick={submitHandler} />
        </form>
        <p>{errorMsg}</p>
        <Modal className={styles.react_model} isOpen={Popup}>
          <div className={styles.popup_container}>
            <p className={styles.popup_close} onClick={() => setPopUp(false)}>
              X
            </p>
            <div>
              <input
                className="mb-4 p-1"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
              <button
                className="btn btn-outline-light m-3"
                onClick={() => {
                  if (event !== "") {
                    setPopUp(false);
                    PostEvent();
                    getEventLists()
                  }
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <div className="d-flex mb-4" style={{ width: "30%" }}>
        <h4 className={loading} style={{ paddingLeft: "100px" }}>
          Loading...
        </h4>
      </div>

      <div className={styles.tableContainer}>
        <table>
          {fetchedData !== undefined &&
            fetchedData.map((item) => {
              //console.log(fetchedData.indexOf(item));
              return (
                <tr key={fetchedData.indexOf(item) + 1}>
                  <td>{fetchedData.indexOf(item) + 1}</td>
                  <td>{item.attributes.name}</td>
                  <td>{item.attributes.email}</td>
                  <td>{item.attributes.status}</td>
                  <td>
                    <button
                      className="btn btn-outline-light"
                      onClick={() => deleteHandler(item)}
                    >
                      delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </table>
      </div>
    </center>
  );
}
