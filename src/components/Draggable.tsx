import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
const { BrowserWindow } = require('electron').remote;

interface DraggableProps {
    children: React.ReactNode
}

export default function Draggable({ children }: DraggableProps) {
    const [ id ] = useState(nanoid);
    const [ offset, setOffset ] = useState([] as number[]);
    const [ dragging, setDragging ] = useState(false);
    useEffect(() => {
        const element = document.getElementById('id' + id);
        if(element === null) return;
        element.addEventListener('mousedown', (e) => {
            setDragging(true);
            setOffset([e.pageX, e.pageY]);
        });
        element.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if(dragging) {
                try {
                    BrowserWindow.getFocusedWindow().setPosition(e.screenX - offset[0], e.screenY - offset[1]);
                }
                catch(error) {
                    console.error(error);
                }
            }
        });
        element.addEventListener('mouseup', (e) => {
            setDragging(false);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, offset, dragging]);
    return (
        <div id={'id' + id}>{children}</div>
    );
}
