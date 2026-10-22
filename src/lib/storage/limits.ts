// A Vercel rejeita requisições acima de ~4,5 MB (HTTP 413) antes de chegar na rota.
// 4 MB no total deixa folga para os demais campos do formulário. Sem "server-only"
// de propósito: também é usado nos formulários (validação no navegador).
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";
