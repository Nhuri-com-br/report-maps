# Report Maps

Plataforma web colaborativa para registrar e acompanhar problemas urbanos (buracos, alagamentos, queda de energia, queimadas, iluminação pública e lixo acumulado). O cidadão marca o local no mapa, descreve o problema, anexa uma foto e acompanha o status do relato.

Projeto de conclusão do curso técnico em Desenvolvimento de Sistemas (Etec Prof. Armando Bayeux da Silva).

**Integrantes:** Lucas Ryan da Silva Santana, João Pedro Grassi de Almeida e Yuri Angelo Dragoni.

**Site:** https://report-maps.vercel.app

## Funcionalidades

- Mapa interativo com os relatos de todos os usuários
- Criação de relato tocando no mapa (local ajustável arrastando o pino)
- Foto opcional, comprimida no navegador antes do envio
- Endereço preenchido automaticamente a partir do ponto marcado
- Botão "Minha localização" (GPS do dispositivo)
- Curtidas e comentários (fórum por relato)
- Status do relato: Pendente, Em progresso e Resolvido
- Painel de administração: alterar status e apagar relatos
- Login com Google

## Tecnologias

React 19, Vite, TypeScript, Tailwind CSS, Leaflet (OpenStreetMap), Firebase (Authentication e Firestore), Vercel.

## Como rodar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Use `localhost` e não o endereço de IP: o login com Google só funciona em domínios autorizados no Firebase.

Outros comandos:

```bash
npm run lint     # verificação de código
npm run build    # gera a versão de produção
```

## Firebase

A configuração do projeto está em `firebase-applet-config.json`. As regras de segurança estão em `firestore.rules`. **Editar esse arquivo não atualiza o Firebase:** o conteúdo precisa ser colado e publicado em Firestore Database, aba Regras, no console do Firebase.

### Administradores

Quem é administrador é definido pela coleção `admins` do Firestore. Para adicionar uma pessoa, crie manualmente no console do Firebase um documento nessa coleção cujo ID é o UID dela (Authentication, aba Usuários). A coleção não pode ser alterada pelo site.

## Estrutura

```
src/
  components/   Header, Sidebar, MobileNav, MapView, Modal, ReportForm
  services/     issueService, commentService (acesso ao Firestore)
  lib/          firebase, geocode, useIsAdmin, utils
  App.tsx       telas e fluxo principal
firestore.rules regras de segurança do banco
```