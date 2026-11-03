# Blog Escolar - projeto Fiap

App mobile em React Native (Expo) onde professores publicam, editam
e excluem posts e podem cadastrar um professor ou usuário no aplicativo, e alunos consultam o conteúdo.

## Tecnologias
- React Native + Expo
- TypeScript
- Axios (consumo da API)

## Como rodar
1. `npm install`
2. Ajuste o endereço da API em `services/api.ts`
3. `npx expo start`
4. Abra no Expo Go ou no emulador

## Estrutura
- `components/PostCard.tsx`: card de post para o aluno
- `components/PostCardAdmin.tsx`: card com Editar e Excluir (professor)
- `components/ProfessorNav.tsx`: menu do portal do professor

## Acesso de teste
- Professor: email@teste.com / senha: 123456