import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth, db} from '../firebase'

const style = {
    button: `bg-gray-200 px-4 py-2 hover:bg-gray-100`
}

const Stats = () => {
    const [user] = useAuthState(auth);
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

    function mostrarEstadisticas(){
        var lista=[];
        for (let index = 0; index < usuarios.length; index++) {
            const element = usuarios[index];
            lista.push([(parseInt(element.pictures)+parseInt(element.audios)+parseInt(element.files)+parseInt(element.textmessages)),element.name])
            
        }
        var sortedArray = lista.sort(function(a, b) {
            return b[0] - a[0];
          });
        var activo=sortedArray[0][1]
        var inactivo=sortedArray[sortedArray.length-1][1]
        for (let index = 0; index < usuarios.length; index++) {
            const element = usuarios[index];
            if (user.uid===element.uid){
                if ((parseInt(element.pictures)+parseInt(element.audios)+parseInt(element.files)+parseInt(element.textmessages))===0){
                    alert("Debe de enviar al menos un mensaje para ver sus estadisticas")
                    return
                }
                alert("Mensajes de texto: "+element.textmessages+"\n"+
                        "Imagenes: "+element.pictures+"\n"+
                        "Audios: "+element.audios+"\n"+
                        "Videos: "+element.videos+"\n"+
                        "Archivos: "+element.files+"\n"+
                        "Palabras: "+element.words+"\n"+
                        "Usuario más activo: "+activo+"\n"+
                        "Usuario menos activo: "+inactivo)
                        return;
            }
        }
        alert("Debe de enviar al menos un mensaje para ver sus estadisticas")
        return;
    }

    function mostrarBloqueados(){
      alert("No tiene bloqueados\n"+user.uid);
      return;
  }

  return (
    <div>
    <button onClick={() => mostrarEstadisticas()} className={style.button}>
        Estadísticas
    </button>
    <button onClick={() => mostrarBloqueados()} className={style.button}>
        Bloqueados
    </button>
    </div>
  );
};

export default Stats;
