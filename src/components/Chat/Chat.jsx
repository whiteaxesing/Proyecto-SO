import React, { useState, useEffect, useRef } from 'react';
import Message from '../Message/Message';
import SendMessage from '../SendMessage';
import { db } from '../../firebase';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import * as CryptoJS from 'crypto-js';

const style = {
  main: "flex flex-col p-[10px] overflow-auto mb-[50px]"
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const scroll = useRef();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      for (let index = 0; index < messages.length; index++) {
        const element = messages[index];
        if (element.text !== "") {
          element.text = (CryptoJS.AES.decrypt(element.text, "contraseña secreta").toString(CryptoJS.enc.Utf8));
          
        }
        if (element.url!==""){
          element.url=(CryptoJS.AES.decrypt(element.url, "contraseña secreta").toString(CryptoJS.enc.Utf8));
          element.type=(CryptoJS.AES.decrypt(element.type, "contraseña secreta").toString(CryptoJS.enc.Utf8));
        }
        element.name = (CryptoJS.AES.decrypt(element.name, "contraseña secreta").toString(CryptoJS.enc.Utf8));
        element.uid = (CryptoJS.AES.decrypt(element.uid, "contraseña secreta").toString(CryptoJS.enc.Utf8));
      }
      setMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <main className={style.main}>
        {messages &&
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
      </main>
      <SendMessage scroll={scroll} />
      <span ref={scroll}></span>
    </>
  );
};

export default Chat;
