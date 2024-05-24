export interface IComment {
  exactTextToHighlight: string;
  commentText: string;
  daemonId: string;
}

export interface IDaemon {
  id: string;
  name: string;
  color: string;
  highlightColor: string;
  description: string;
}
