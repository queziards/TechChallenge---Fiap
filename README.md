# Blog Escolar - projeto Fiap

Aplicativo Expo/React Native para publicação e leitura de posts escolares. Professores e administradores gerenciam publicações e cadastros conforme suas permissões; alunos consultam os posts e podem comentar após autenticação.

## Tecnologias
- React Native + Expo
- TypeScript
- Axios (consumo da API)

## Executar localmente

1. Instale as dependências: `npm ci`
2. Configure a URL da API em `EXPO_PUBLIC_API_URL` ou ajuste o fallback em `src/services/api.ts`.
3. Inicie o Expo: `npx expo start`
4. Abra no Expo Go, emulador, simulador ou navegador.

## Testes e validações

- `npm test` executa os testes unitários.
- `npm run typecheck` verifica os tipos TypeScript.
- `npm run build:web` exporta a aplicação web para `dist/`.

O GitHub Actions executa essas verificações em pull requests e pushes para `main`/`master`, além de validar a imagem Docker. O workflow apenas valida o projeto; não publica nem implanta a aplicação.

## Executar a versão web com Docker

1. Copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL` para um endereço acessível pelo navegador.
2. Execute `docker compose up --build`.
3. Acesse `http://localhost:8080`.

Para testar contra um back-end no computador host usando Docker Desktop, `http://host.docker.internal:3333/api/v1` costuma ser acessível. A URL da API é incorporada ao bundle durante a criação da imagem.

O container é executado localmente; não há publicação automática da imagem ou deploy.

## Estrutura
- `components/PostCard.tsx`: card de post para o aluno
- `components/PostCardAdmin.tsx`: card com Editar e Excluir (professor)
- `components/ProfessorNav.tsx`: menu do portal do professor
