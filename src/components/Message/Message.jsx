import React, { useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { auth, db } from '../../firebase'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { addDoc, collection,doc, deleteDoc, updateDoc } from "firebase/firestore";
import * as CryptoJS from 'crypto-js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSpeechSynthesis } from 'react-speech-kit';


const style = {
  message: `flex items-center shadow-xl m-4 py-2 px-3 rounded-tl-full rounded-tr-full`,
  name: `relative mt-[-4rem] text-gray-800 text-xs`,
  name2: `relative mt-[-15rem] text-gray-800 text-xs`,
  sent: `bg-[#395dff] text-white flex-row-reverse text-end float-right rounded-bl-full`,
  received: `bg-[#e5e5ea] text-black float-left rounded-br-full`,
};

const Message = ({ message }) => {
  const [user] = useAuthState(auth);
  const messageClass =
    message.uid === auth.currentUser.uid
      ? `${style.sent}`
      : `${style.received}`

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
  let hour = d.getHours();
  let minutes = d.getMinutes();
  let seconds = d.getSeconds();

  if (hour===0 && minutes===0 && seconds===0){

      deleteDoc(doc(db,"messages",message.id))
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
  const {speak}=useSpeechSynthesis({
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
       if (message.url!==""){
        if ((message.type==="image/jpg") || (message.type==="image/png") || (message.type==="image/jpeg"))
          return (<div className={`${style.message} ${messageClass}`}>
          <div className={style.name2}>{message.name}</div><img src={message.url} width="300" height="300"></img> <ButtonDropdown hidden={enviado} isOpen={dropdown} toggle={abrirCerrarDropdown}>
            <DropdownToggle caret color="primary" />
            <DropdownMenu>
              <DropdownItem onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown></div>);
        else
          return (<div className={`${style.message} ${messageClass}`}>
          <div className={style.name}>{message.name}</div><a className='myDivClass' href={message.url+".word"}>Click para ver archivo</a> <ButtonDropdown hidden={enviado} isOpen={dropdown} toggle={abrirCerrarDropdown}>
            <DropdownToggle caret color="primary" />
            <DropdownMenu>
              <DropdownItem onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown></div>);
       }
       else{
        return (<div>
        <div className={`${style.message} ${messageClass}`}>
      <p className={style.name}>{message.name}</p>
        <div>
          <Input
            hidden={!editado} onChange={keyDownHandler}
            defaultValue={message.text} />
          <a hidden={editado}>{message.text}</a>
          <ButtonDropdown isOpen={dropdown} toggle={abrirCerrarDropdown}>
            <DropdownToggle caret color="primary" />
            <DropdownMenu>
              <DropdownItem onClick={() => speak({text:message.text})}>Escuchar</DropdownItem>
              <DropdownItem hidden={enviado} onClick={() => editar(message.id)}>Editar</DropdownItem>
              <DropdownItem hidden={enviado} onClick={() => eliminar(message.id)}>Eliminar</DropdownItem>
              <DropdownItem hidden={!enviado} onClick={() => bloquear(message.id)}>Blockear remitente</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        </div>
      </div>
      </div>);}
       })()
      }
    </div>
  );
};

export default Message;
