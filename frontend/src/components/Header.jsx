import React from 'react'
import {useState} from "react"
import {Link,useNavigate,useLocation} from "react-router-dom"
import { useSelector,useDispatch } from 'react-redux'
import {logout,reset} from "../features/auth/authSlice.js"

const Header = () => {
  const navigate=useNavigate();
  return (
    <div>

    </div>
  )
}

export default Header