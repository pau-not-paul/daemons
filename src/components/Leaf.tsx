import { useEffect, useRef, useState } from 'react';
import { defaultDaemons } from '../components/Daemons';
import { DaemonPopup } from '../components/DaemonPopup';

export const Leaf = ({ attributes, children, leaf, ignoreComment, editor }:
  {
    attributes: any;
    children: React.ReactNode;
    leaf: any;
    ignoreComment: (comment: any) => void;
    editor: any;
  }
) => {
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    setShowPopup(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowPopup(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const daemon = leaf.comment ? defaultDaemons.find(d => d.id === leaf.comment.daemonId) : null;

  return (
    <span
      {...attributes}
      style={{
        backgroundColor: leaf.comment ? daemon?.highlightColor : 'transparent',
        position: 'relative',
      }}
      onMouseEnter={leaf.comment && handleMouseEnter}
      onMouseLeave={leaf.comment && handleMouseLeave}
    >
      {children}
      {leaf.comment && daemon && (
        <DaemonPopup
          showPopup={showPopup}
          daemon={daemon}
          comment={leaf.comment}
          editor={editor}
          ignoreComment={ignoreComment}
        />
      )}
    </span>
  );
};

