# Gerenciador de fotos

Aplicação web para cadastrar usuários, álbuns e fotos. O frontend é servido pelo Nginx, o backend usa Node.js e os dados ficam no MongoDB.

## Requisitos

- Docker Desktop em execução
- Docker Compose v2 (`docker compose`)

## Configuração

Na raiz do projeto, crie o arquivo `.env` a partir do exemplo `.env.example`.

Edite `.env` e troque `MONGO_ROOT_PASSWORD` e `JWT_SECRET` por valores próprios. Não compartilhe nem envie o `.env` para o Git.

## Executar

Na raiz do projeto execute o comando pelo poweshell:

```sh
docker compose up --build
```

O Compose inicia o MongoDB, espera o banco ficar saudável e então inicia o backend e o frontend.

- Frontend: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login.html](http://localhost:3000/login.html)
- Cadastro: [http://localhost:3000/registrar.html](http://localhost:3000/registrar.html)
- API: [http://localhost:8000](http://localhost:8000)

Crie uma conta pela página de cadastro e depois entre para acessar o painel.

Para acompanhar os logs do backend em outro terminal:

```sh
docker compose logs -f backend
```

Para parar os serviços:

```sh
docker compose down
```

Os dados do MongoDB permanecem no volume Docker entre execuções. `docker compose down -v` também remove esse volume e apaga os dados salvos.
