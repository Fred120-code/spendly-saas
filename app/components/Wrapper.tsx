import React from 'react'
import Navbar from './Navbar'

type WrapperProps = {
    children: React.ReactNode;
}

const Wrapper = ({children}:WrapperProps) => {
  return (
    <div className=" w-full px-5 space-x-4 lg:px-10 max-w-7xl mx-auto ">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

export default Wrapper