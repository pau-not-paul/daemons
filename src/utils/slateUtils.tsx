import { BaseElement, Editor, Node, Path, Point, Range, Text, Transforms } from 'slate'
import { IComment } from '../types/index';

declare module 'slate' {
  export interface BaseText {
    comment?: IComment;
  }
}

export const serialize = (nodes: Node[]) => nodes.map(n => Node.string(n)).join('\n');

export const addComment = ({ editor, anchor, focus, comment }: {
  editor: Editor;
  comment: IComment;
  anchor: Point;
  focus: Point;
}): void => {
  Transforms.setNodes(
    editor,
    { comment },
    {
      at: { anchor, focus },
      match: (n) => Text.isText(n),
      split: true,
    }
  );
};

export const findText = (editor: Editor, searchText: string) => {
  for (let parIdx = 0; parIdx < editor.children.length; parIdx++) {
    const paragraph = editor.children[parIdx] as BaseElement;
    const paragraphText = paragraph.children.map(n => Node.string(n)).join('');


    const index = paragraphText.indexOf(searchText);
    if (index === -1) continue;

    let currentOffset = 0;
    let anchorPath, anchorOffset, focusPath, focusOffset;

    for (let wordIdx = 0; wordIdx < paragraph.children.length; wordIdx++) {
      const word = paragraph.children[wordIdx];
      const wordText = Node.string(word);
      const wordLength = wordText.length;

      if (currentOffset <= index && index < currentOffset + wordLength) {
        anchorPath = [parIdx, wordIdx];
        anchorOffset = index - currentOffset;
      }

      if (currentOffset <= index + searchText.length && index + searchText.length <= currentOffset + wordLength) {
        focusPath = [parIdx, wordIdx];
        focusOffset = index + searchText.length - currentOffset;
        break;
      }

      currentOffset += wordLength;
    }

    return {
      anchor: { path: anchorPath as Path, offset: anchorOffset as number },
      focus: { path: focusPath as Path, offset: focusOffset as number }
    };
  }

  return null;
};

export const clearComment = ({ editor, comment }: { editor: Editor, comment: IComment }) => {
  Transforms.setNodes(
    editor,
    { comment: undefined },
    {
      at: [],
      match: (n) =>
        Text.isText(n) &&
        n.comment?.exactTextToHighlight === comment.exactTextToHighlight &&
        n.comment?.commentText === comment.commentText,
      split: true,
    }
  );
}

export const clearCommentCurrentPosition = ({ editor }: { editor: Editor }) => {
  const comment = getCommentInCurrentWord({ editor });
  if (comment) clearComment({ editor, comment });
}

const getCommentInCurrentWord = ({ editor }: { editor: Editor }) => {
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [node] = Editor.node(editor, selection);

    if ('comment' in node) return node.comment;
  }

  return null;
};

export const initialText = [
  {
    type: 'paragraph',
    children: [
      {
        text: `Language models are not yet good enough to be reliable thinking partners. `
      },
      {
        text: `Their frequent hallucinations make it difficult to know if their factual claims are valid.`,
        comment: {
          commentText: `Do you have any evidence to back this up? What sources or data prove that they "frequently hallucinate"?`,
          daemonId: `devils_advocate`,
          exactTextToHighlight: `Their frequent hallucinations make it difficult to know if their factual claims are valid.`,
        }
      },
      {
        text: ` They are unreliable narrators until proven otherwise. If you ask them for references, they'll happily generate very real sounding journal names, author names, and URLs. None of which exist.`
      }
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: `\nUntil we drastically improve their ability to respond with accurate factual information and real citations, we can't treat them as a reliable source of knowledge.` }],
  },
];
