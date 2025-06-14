# README - Por Onde Andei 📍📱

## Descrição do Projeto
Aplicativo desenvolvido em **React Native com Expo** para registrar e visualizar locais visitados, funcionando como um diário de viagens ou mapa de memórias.

## 📌 Funcionalidades

- ✅ Cadastro e autenticação de usuários
- 📸 Captura de fotos com a câmera do dispositivo
- 🗺️ Registro automático da localização
- 📅 Data e hora automaticamente associadas
- 🔒 Autenticação por biometria (Face ID/Touch ID)
- 🏠 Listagem dos locais visitados
- 🗄️ Armazenamento local com SQLite
- 🗺️ Visualização em mapa com marcadores

## 🚀 Tecnologias Utilizadas


- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## 📦 Como Executar o Projeto

### Pré-requisitos
- Node.js (v16 ou superior)
- Expo CLI instalado globalmente (npm install -g expo-cli)
- Dispositivo móvel com o app Expo Go ou emulador configurado

### Instalação
1. Clone este repositório:
   ```sh
   git clone https://github.com/me-cbr/por-onde-andei.git
   ```
2. Entre no diretório do projeto:
   ```sh
   cd por-onde-passei
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Inicie o projeto:
   ```sh
   npx expo start
   ```
5. Escaneie o QR code com o app Expo Go ou execute no emulador.


## 📂 Estrutura do Projeto

```
por-onde-andei/
├── assets/            # Imagens e ícones
├── components/        # Componentes reutilizáveis
├── database/          # Configuração do SQLite
├── screens/           # Telas da aplicação
├── App.js             # Arquivo principal
├── app.json           # Configurações do Expo
└── README.md          # Documentação do projeto
```

## 🐞 Possíveis Problemas

### Erro com `expo-sqlite`:

Caso apareça o erro:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'expo-sqlite'
```

Execute:

```bash
npx expo install expo-sqlite
```

## Configuração
O arquivo app.json contém todas as configurações necessárias, incluindo:
- Permissões de câmera e localização
- Configurações de biometria
- Identificação do app
- Ícones e splash screen


## 📄 Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Desenvolvedora
- **Maria Eduarda Coelho**  - [![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/me-cbr)


## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
