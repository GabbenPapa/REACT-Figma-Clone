import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";

import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";


const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden, });
    const [reaction, setReaction] = useState<Reaction[]>([]);

    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            setReaction((reactions) => reactions.concat([
                {
                    point:{x: cursor.x,y: cursor.y,},
                    value: cursorState.reaction,
                    timestamp: Date.now(),
                }
            ]));
        }
    }, 100);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({ cursor: { x, y, } }); 
        }
    }, []);
    
    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden});
        updateMyPresence({ cursor: null, message: null });
    }, []);

    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
    }, [cursorState.mode, setCursorState]);
    
    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({ cursor: { x, y } });

    }, [cursorState.mode, setCursorState]);

    useEffect(() => {
        const onKeyUp = (event: KeyboardEvent) => {
            if(event.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: '',
                })
            } else if (event.key === 'Escape') {
                updateMyPresence({ 
                    message: null 
                });
                setCursorState({
                    mode: CursorMode.Hidden,
                })
            } else if (event.key === "*") {
                setCursorState({ mode: CursorMode.ReactionSelector });
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === '/') {
                event.preventDefault();
            }
        }

        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        }

    }, [updateMyPresence])

    const setReactions = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, [])

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center bg-black text-center "
        >
            <h1 className="text-2xl text-white">Figma Clone</h1>

            {/* {reaction.map((reaction) => (
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))} */}

            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}

            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={setReactions}
                />
            )}
            <LiveCursors others={others}/>
        </div>
    )
}

export default Live