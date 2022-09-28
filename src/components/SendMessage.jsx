import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { uploadFile, getType } from '../firebase';
import * as CryptoJS from 'crypto-js';
import emailjs from 'emailjs-com'

const style = {
  form: `h-14 w-full max-w-[728px]  flex text-xl absolute bottom-0`,
  input: `w-full text-xl p-3 bg-gray-900 text-white outline-none border-none`,
  button: `w-[20%] bg-green-500`,
};
const SendMessage = ({ scroll }) => {

  const [input, setInput] = useState('');


  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let usuarios = [];
      querySnapshot.forEach((doc) => {
        usuarios.push({ ...doc.data(), id: doc.id });
      });
      setUsuarios(usuarios);
    });
    return () => unsubscribe();
  }, []);

  const d = new Date();
  let hour = d.getHours();
  let minutes = d.getMinutes();
  let seconds = d.getSeconds();

  if (hour === 0 && minutes === 0 && seconds === 0) {
    for (let index = 0; index < usuarios.length; index++) {
      const element = usuarios[index];
      deleteDoc(doc(db, "users", element.id))
    }
  }

  const apiKey = "6992d07bf7f571c5bb5f6e6b04d85762";

  const sendMessage = async (e) => {
    e.preventDefault()
    if (input[0] === "/" && input[1] === "a") {
      const day= input[3]+input[4]
      const month=input[6]+input[7]
      const year=input[9]+input[10]+input[11]+input[12]
      const hour= input[14]+input[15]
      const minutes=input[17]+input[18]
      const alerta = input.slice(-(input.length - 20));

      var templateParams = {
        'useremail': auth.currentUser.email,
        'subject': 'Alerta ChatSO',
        'name': 'ChatSO',
        'message': alerta+"a las: "+hour.toString()+":"+minutes.toString()+" del "+day.toString()+"/"+month.toString()+"/"+year.toString()
      };

      emailjs.send('gmail', 'template_1oclq4c', templateParams, '36Ts8NO8hHAp-hmEx')
      .then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
      }, function (error) {
        console.log('FAILED...', error);
      });


      await addDoc(collection(db, 'alerts'), {
        alert: alerta,
        day: day,
        month: month,
        year: year,
        hour: hour,
        minutes: minutes,
        email: auth.currentUser.email
      })
      
      setInput('')
      scroll.current.scrollIntoView({ behavior: 'smooth' })
      alert('Agregado correctamente')
      return;
    }

    if (input[0] === "/" && input[1] === "w") {
      var consulta = {};
      const ciudad = input.slice(-(input.length - 3));
      await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&units=imperial&APPID=${apiKey}`).then(
        response => response.json()
      ).then(
        data => {
          consulta = data;
        }
      )
      if (consulta.cod === "404") {
        await addDoc(collection(db, 'messages'), {
          text: CryptoJS.AES.encrypt("No se ha encontrado esa ciudad", "contraseña secreta").toString(),
          url: "",
          type: "",
          name: CryptoJS.AES.encrypt("BotClimatico", "contraseña secreta").toString(),
          uid: CryptoJS.AES.encrypt("Bot1", "contraseña secreta").toString(),
          timestamp: serverTimestamp()
        })
        setInput('')
        scroll.current.scrollIntoView({ behavior: 'smooth' })
        return;
      }
      await addDoc(collection(db, 'messages'), {
        text: CryptoJS.AES.encrypt("La temperatura en " + consulta.name + " es: " + Math.round(consulta.main.temp) + " F, ", "contraseña secreta").toString(),
        url: "",
        type: "",
        name: CryptoJS.AES.encrypt("BotClimatico", "contraseña secreta").toString(),
        uid: CryptoJS.AES.encrypt("Bot1", "contraseña secreta").toString(),
        timestamp: serverTimestamp()
      }

      )

      setInput('')
      scroll.current.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (input === '') {
      alert('Por favor ingrese un mensaje válido')
      return
    }
    const { uid, displayName } = auth.currentUser
    await addDoc(collection(db, 'messages'), {
      text: CryptoJS.AES.encrypt(input, "contraseña secreta").toString(),
      url: "",
      type: "",
      name: CryptoJS.AES.encrypt(displayName, "contraseña secreta").toString(),
      uid: CryptoJS.AES.encrypt(uid, "contraseña secreta").toString(),
      timestamp: serverTimestamp()
    })
    enviarMensajeTexto(uid, displayName, input);
    setInput('')
    scroll.current.scrollIntoView({ behavior: 'smooth' })
  }

  function wordCount(text = '') {
    return text.split(/\S+/).length - 1;
  };

  function enviarMensajeTexto(uid, nombre, texto) {
    var palabras = wordCount(texto);
    for (let index = 0; index < usuarios.length; index++) {
      const element = usuarios[index];
      if (element.uid === uid) {
        updateDoc(doc(db, "users", element.id), {
          words: (parseInt(element.words) + palabras).toString(),
          textmessages: (parseInt(element.textmessages) + 1).toString()
        })
        return;
      }
    }
    addDoc(collection(db, 'users'), {
      audios: "0",
      files: "0",
      name: nombre,
      videos: "0",
      pictures: "0",
      textmessages: "1",
      words: palabras.toString(),
      uid: uid
    })
  }

  function enviarMensajeArchivo(uid, nombre, tipo) {
    for (let index = 0; index < usuarios.length; index++) {
      const element = usuarios[index];
      if (element.uid === uid) {
        if (tipo === "image/jpeg" || tipo === "image/png" || tipo === "image/jpg") {
          updateDoc(doc(db, "users", element.id), {
            pictures: (parseInt(element.pictures) + 1).toString()
          })
          return;
        }
        if (tipo === "audio/mpeg" || tipo === "audio/x-m4a") {
          updateDoc(doc(db, "users", element.id), {
            audios: (parseInt(element.audios) + 1).toString()
          })
          return;
        }
        if (tipo === "video/mp4") {
          updateDoc(doc(db, "users", element.id), {
            videos: (parseInt(element.videos) + 1).toString()
          })
          return;
        }
        updateDoc(doc(db, "users", element.id), {
          files: (parseInt(element.files) + 1).toString()
        })
        return;
      }
    }
    if (tipo === "image/jpeg" || tipo === "image/png" || tipo === "image/jpg") {
      addDoc(collection(db, 'users'), {
        audios: "0",
        files: "0",
        videos: "0",
        name: nombre,
        pictures: "1",
        textmessages: "0",
        words: "0",
        uid: uid
      })
      return;
    }
    if (tipo === "video/mp4") {
      console.log("aaa")
      addDoc(collection(db, 'users'), {
        audios: "0",
        files: "0",
        videos: "1",
        name: nombre,
        pictures: "0",
        textmessages: "0",
        words: "0",
        uid: uid
      })
      return;
    }
    if (tipo === "audio/mpeg" || tipo === "audio/x-m4a") {
      addDoc(collection(db, 'users'), {
        audios: "1",
        files: "0",
        videos: "0",
        name: nombre,
        pictures: "0",
        textmessages: "0",
        words: "0",
        uid: uid
      })
      return;
    }
    addDoc(collection(db, 'users'), {
      audios: "0",
      files: "1",
      videos: "0",
      name: nombre,
      pictures: "0",
      textmessages: "0",
      words: "0",
      uid: uid
    })
    return;
  }

  const subirArchivo = async (e) => {
    const result = await uploadFile(e.target.files[0]);
    const type = await getType(result[1])
    const { uid, displayName } = auth.currentUser
    await addDoc(collection(db, 'messages'), {
      text: CryptoJS.AES.encrypt(input, "contraseña secreta").toString(),
      url: CryptoJS.AES.encrypt(result[0], "contraseña secreta").toString(),
      type: CryptoJS.AES.encrypt(type, "contraseña secreta").toString(),
      name: CryptoJS.AES.encrypt(displayName, "contraseña secreta").toString(),
      uid: CryptoJS.AES.encrypt(uid, "contraseña secreta").toString(),
      timestamp: serverTimestamp()
    })
    setInput('')
    enviarMensajeArchivo(uid, displayName, type);
    scroll.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <form onSubmit={sendMessage} className={style.form}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={style.input}
        type='text'
        placeholder='Mensaje'
      />
      <button className={style.button} type='submit'>
        Enviar
      </button>
      <div>
        <label for="file-input">
          <img src="data:image/png;base64,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" height="1000" width="74" />
        </label>
        <input style={{ display: 'none' }} onChange={e => subirArchivo(e)} id="file-input" type="file" />
      </div>
    </form>
  );
};

export default SendMessage;