import React from 'react'
import {auth} from '../firebase'
import { Button} from 'reactstrap';

const style = {
    button: `bg-gray-200 px-4 py-2 hover:bg-gray-100`
}


const LogOut = () => {
const signOut = () => {
    signOut(auth)
}

  return (
    <Button onClick={() => auth.signOut()} className={style.button}>
        Salir
    </Button>
  )
}

export default LogOut