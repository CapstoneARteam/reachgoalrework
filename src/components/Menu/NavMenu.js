import React from 'react'
import styled from 'styled-components'
import Menu from './Menu'


const StyledBurger = styled.button`
  position: fixed;
  top: 10px;
  right: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1502;

  &:focus {
    outline: none;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: ${({ open }) => open ? '#FFFFFF' : '#FFFFFF'};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-child {
      transform: ${({ open }) => open ? 'rotate(45deg)' : 'rotate(0)'};
    }

    :nth-child(2) {
      opacity: ${({ open }) => open ? '0' : '1'};
      transform: ${({ open }) => open ? 'translateX(20px)' : 'translateX(0)'};
    }

    :nth-child(3) {
      transform: ${({ open }) => open ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`

const Burger = ({ open, setOpen, center_container }) => {
  console.log(center_container.center_container.current)
  return (
    <StyledBurger open={open} onClick={() => {
      setOpen(!open)
      if(!open)
        center_container.center_container.current.style.opacity = .5 
      else
        center_container.center_container.current.style.opacity = 1
    }}>
      <div />
      <div />
      <div />
    </StyledBurger>
  )
}




const NavMenu = (center_container) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div>
        <Burger open={open} setOpen={setOpen} center_container={center_container} />
        <Menu open={open} setOpen={setOpen} center_container={center_container}/>
        </div>
    )
}

export default NavMenu