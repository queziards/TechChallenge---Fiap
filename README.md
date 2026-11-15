# Blog Escolar

Aplicativo multiplataforma para leitura e gestão de publicações escolares. Alunos podem consultar posts, pesquisar publicações e participar das conversas; professores e administradores têm acesso a um portal para gerenciar posts e cadastros, respeitando suas permissões.

## Funcionalidades

- Listagem paginada e pesquisa de posts.
- Visualização de posts e comentários; alunos autenticados podem criar, editar e excluir os próprios comentários.
- Login de alunos e professores, com sessão armazenada no dispositivo.
- Portal para professores criarem e gerenciarem posts e alunos.
- Professores podem editar os próprios posts; administradores podem gerenciar posts e cadastros de professores.
- Interface feita com React Native e Expo para Android, iOS e web.

## Tecnologias

- Expo SDK 58, React Native 0.88 e Expo Router.
- TypeScript e React 19.
- Axios para integração com a API REST.
- AsyncStorage para persistência local da sessão.
- Docker e Nginx para servir a versão web.

## Pré-requisitos

- Node.js 22 e npm.
- API do projeto disponível em uma URL acessível pelo dispositivo ou navegador.
- Docker Desktop, caso queira executar a versão web em container.

## Configuração e execução local

1. Instale as dependências:

   ```sh
   npm ci
   ```

2. Crie um arquivo `.env` na raiz e configure o endereço da API:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3333/api/v1
   ```

   O valor deve apontar para a API e incluir o prefixo `/api/v1`. Em um celular físico, use o endereço IP da máquina que executa a API, em vez de `localhost`. Para Android Emulator, use o endereço de host acessível pelo emulador.

3. Inicie o Expo:

   ```sh
   npx expo start
   ```

   Use as opções do terminal para abrir no Android, iOS ou web. Para iniciar diretamente na web, execute `npm run web`.

> A configuração usada pela aplicação é `EXPO_PUBLIC_API_URL`. Se ela não estiver definida, o cliente usa o endereço de desenvolvimento configurado em `src/services/api.ts`.

## Testes e validações

```sh
npm test
npm run typecheck
npm run lint
npm run build:web
```

O workflow do GitHub Actions executa typecheck, testes, exportação web e build da imagem Docker em pull requests e pushes para `main` ou `master`. Ele valida o projeto, mas não publica a imagem nem implanta a aplicação.

## Executar a versão web com Docker

1. Crie `.env` a partir do exemplo `.env.example` e ajuste `EXPO_PUBLIC_API_URL` para uma URL acessível pelo navegador. Para acessar uma API executada no computador host usando Docker Desktop, o exemplo usa `http://host.docker.internal:3333/api/v1`.
2. Execute:

   ```sh
   docker compose up --build
   ```

3. Acesse [http://localhost:8080](http://localhost:8080).

A variável `EXPO_PUBLIC_API_URL` é incorporada ao bundle durante a criação da imagem. Para alterar a URL, reconstrua a imagem. O container é executado localmente; não há publicação ou deploy automático.

## Estrutura do projeto

```text
src/
├── app/          # Rotas e layouts do Expo Router
├── components/   # Componentes reutilizáveis da interface
├── screens/      # Telas de alunos e do portal de professores
├── services/     # Cliente HTTP, autenticação e tratamento de erros da API
├── hooks/        # Hooks de tema e autorização
└── utils/        # Regras de permissões e paginação
```
