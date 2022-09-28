import { collection, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, Input} from 'reactstrap';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth, db} from '../firebase'

const style = {
    button: `bg-gray-200 px-4 py-2 hover:bg-gray-100`
}

const Stats = () => {
    const [input, setInput] = useState('');
    const [user] = useAuthState(auth);
    const [usuarios, setUsuarios] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [dropdown, setDropdown] = useState(false);

    const abrirCerrarDropdown = () => {
      setDropdown(!dropdown)
    }
  
    useEffect(() => {
      const q = query(collection(db, 'blocks'), where("blockedBy", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let blocks = [];
        querySnapshot.forEach((doc) => {
          blocks.push({ ...doc.data(), id: doc.id });
        });
        setBlocks(blocks);
      });
      return () => unsubscribe();
    }, []);

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

  function mostrarBloqueados(id){
    deleteDoc(doc(db, "blocks", id));
  }


  function handleKeyPress(target) {
    if(target.charCode==13){
      alert('Enter clicked!!!');    
    } 
  }


  return (
    <div>
    
    
    <div className="row justify-content-center">
        <div className="col-4">
          <Button color="primary" onClick={() => mostrarEstadisticas()} className={style.button}>
              Stats
          </Button>
        </div>
        <div className="col-4">
          <ButtonDropdown hidden={ blocks.length === 0 ? true : false }  isOpen={dropdown} toggle={abrirCerrarDropdown}>
            <DropdownToggle caret color="primary"> Blocks </DropdownToggle> 
              <DropdownMenu>

              {(() => {
                return(
                  <main className={style.main}>
                    {blocks && 
                    blocks.map((block) => (
                      <DropdownItem onClick={() => mostrarBloqueados(block.id)}>Desbloquear a {block.userBlockerUsername}</DropdownItem>
                    ))} 
                  </main>
                );})()
              }
              </DropdownMenu>
          </ButtonDropdown>
        </div>
        <div className="col-4">
          <Input
            onKeyPress={handleKeyPress} 
            hidden={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={style.input}
            type='text'
            placeholder='Buscar'
          />
        </div>
    </div>
    

      

    
  

    </div>
  );
};

export default Stats;