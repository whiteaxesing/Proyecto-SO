import React from 'react';
import SignIn from './SignIn'
import LogOut from './LogOut'
import {auth} from '../firebase'
import {useAuthState} from 'react-firebase-hooks/auth'
import Stats from './Stats';

const style = {
    nav: `bg-gray-800 h-20 flex justify-between items-center p-4`,
    heading: `text-white text-3xl`
}

const Navbar = () => {
    const [user] = useAuthState(auth)
  return (
    <div className={style.nav}>
      
      <h1 className={style.heading}>ChatTEC</h1>
      {user ? <Stats /> : null}
      {user ? <LogOut /> : <SignIn />}

    </div>
  );
};

export default Navbar;
