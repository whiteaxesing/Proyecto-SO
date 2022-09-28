import React, { useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { auth, db } from '../../firebase'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { addDoc, collection, doc, deleteDoc, updateDoc, query, onSnapshot } from "firebase/firestore";
import * as CryptoJS from 'crypto-js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useEffect } from 'react';
import emailjs from 'emailjs-com'


const style = {
  message: `flex items-center shadow-xl mb-5 m-4 py-2 px-3 rounded-tl-full`,
  message2: `flex items-center shadow-xl mb-5 m-4 py-2 px-3 rounded-tr-full`,
  namesent: `relative -mt-4 mr-6 text-gray-800 text-xs float-right`,
  namesent2: `relative mt-[-15rem] text-gray-800 text-xs float-right`,
  namereceived: `relative -mt-4 ml-7  text-gray-800 text-xs float-left`,
  namereceived2: `relative mt-[-7rem] text-gray-800 text-xs float-left`,
  sent: `bg-[#395dff] right text-white flex-row-reverse text-end float-right rounded-bl-full`,
  received: `bg-[#e5e5ea] text-black float-left rounded-br-full`,
};

const Message = ({ message }) => {
  const [user] = useAuthState(auth);
  const anothermessageClass =
    message.uid === auth.currentUser.uid
      ? `${style.message}`
      : `${style.message2}`
  const messageClass =
    message.uid === auth.currentUser.uid
      ? `${style.sent}`
      : `${style.received}`

  const nameClass =
    message.uid === auth.currentUser.uid
      ? `${style.namesent}`
      : `${style.namereceived}`

  const enviado =
    message.uid === auth.currentUser.uid
      ? false
      : true

  const [dropdown, setDropdown] = useState(false);
  const [editado, setEditado] = useState(false)
  const abrirCerrarDropdown = () => {
    setDropdown(!dropdown)
  }


  const d = new Date();
  let day = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();
  let hour = d.getHours();
  let minutes = d.getMinutes();
  let seconds = d.getSeconds();

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let alerts = [];
      querySnapshot.forEach((doc) => {
        alerts.push({ ...doc.data(), id: doc.id });
      });
      setAlerts(alerts);
    });
    return () => unsubscribe();
  }, []);


  if (hour === 0 && minutes === 0 && seconds === 0) {

    deleteDoc(doc(db, "messages", message.id))
  }

  function eliminar(id) {
    deleteDoc(doc(db, "messages", id));
  }


  function bloquear(id) {
    addDoc(collection(db, 'blocks'), {
      blockedBy: user.uid,
      userBlocked: message.uid
    }
    )
  }


  function editar() {
    setEditado(true)
  }

  function editarMensaje(id, mensaje) {
    updateDoc(doc(db, "messages", id), {
      text: CryptoJS.AES.encrypt(mensaje, "contraseña secreta").toString()
    })

  }
  const { speak } = useSpeechSynthesis({
    default: true,
    lang: "en-AU",
    localService: true,
    name: "Karen",
    voiceURI: "Karen"
  });

  const keyDownHandler = event => {
    document.addEventListener('keydown', keyDownHandler);

    if (event.key === 'Enter') {
      event.preventDefault();
      document.removeEventListener('keydown', keyDownHandler);
      setEditado(false)
      editarMensaje(message.id, event.target.value);

    }

  }
  return (
    <div>
      {
        (() => {
          if (message.url !== "") {
            if ((message.type === "image/jpg") || (message.type === "image/png") || (message.type === "image/jpeg"))
              return (<div>
                <div className={`${style.name} ${nameClass}`}>{message.name}</div>

                <div className={`${anothermessageClass} ${messageClass}`}>
                  <img src={message.url} width="300" height="300"></img> <ButtonDropdown hidden={enviado} isOpen={dropdown} toggle={abrirCerrarDropdown}>
                    <DropdownToggle caret color="btn-outline-dark" />
                    <DropdownMenu>
                      <DropdownItem onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown></div>
              </div>);
            else
              return (<div>
                <div className={`${style.name} ${nameClass}`}>{message.name}</div>
                <div className={`${anothermessageClass} ${messageClass}`}>
                  <a className='myDivClass' href={message.url + ".word"}>Click para ver archivo</a> <ButtonDropdown hidden={enviado} isOpen={dropdown} toggle={abrirCerrarDropdown}>
                    <DropdownToggle caret color="btn-outline-dark" />
                    <DropdownMenu>
                      <DropdownItem onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown></div>
              </div>);
          }
          else {
            return (<div>
              <div className={`${style.name}${nameClass}`}>
                {message.name}
              </div>

              <div className={`${anothermessageClass} ${messageClass}`}>
                <Input
                  hidden={!editado} onChange={keyDownHandler}
                  defaultValue={message.text} />
                <a hidden={editado}>{message.text}</a>
                <ButtonDropdown isOpen={dropdown} toggle={abrirCerrarDropdown}>
                  <DropdownToggle caret color="btn-outline-dark" />
                  <DropdownMenu>
                    <DropdownItem onClick={() => speak({ text: message.text })}>Escuchar</DropdownItem>
                    <DropdownItem hidden={enviado} onClick={() => editar(message.id)}>Editar</DropdownItem>
                    <DropdownItem hidden={enviado} onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
                    <DropdownItem hidden={!enviado} onClick={() => bloquear(message.id)}>Blockear remitente</DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
              </div>
            </div>);
          }
        })()
      }
    </div>
  );
};

export default Message;