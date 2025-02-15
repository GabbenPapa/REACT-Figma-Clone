import CursorSVG from "@/public/assets/CursorSVG";
import { transform } from "next/dist/build/swc";
import React from "react";

type Props = {
    color: string;
    x: number;
    y: number;
    message?: string;
}

const Cursor = ({color,x,y,message}: Props) => {
    return (
        <div className="pointer-events-none absolute top-0 left-0" style={{ transform: `translate(${x}px, ${y}px)`}}>
            <CursorSVG color={color}/>
        
            {message && (
                <div className="absolute top-5 left-2 rounded-3px py-2" style={{ backgroundColor: color }}>
                    <p className="text-white whitespace-nowrap text-sm leading-relaxed" >{message}</p>
                </div>
            )}
        </div>
    )
}

export default Cursor