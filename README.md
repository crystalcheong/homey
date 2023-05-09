### SC2006 Software Engineering Project — _Homey_

> The one-stop-shop property market web application for Singapore<br/>
>
> - [Demo](https://youtu.be/4qLNeD5MUFQ) / [Teaser](https://youtu.be/A9fdw31bSno)
> - [Website](https://homey-sg.vercel.app/)
> - [Documentation](https://github.com/swe-homey/docs)

<br/>

<p align="center">
  <img src="https://user-images.githubusercontent.com/65748007/229656035-194f194d-f5fb-4664-940b-28e90ed96eb9.png" alt="Project Cover"
    width="960px"
  />
</p>

---

#### 🎋 Environments

| Environment | Github branch                                                  | URL                                                                                         |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Production  | [main](https://github.com/crystalcheong/homey)                 | <a href="https://homey-sg.vercel.app/" target="_blank">https://homey-sg.vercel.app/</a>     |
| Staging     | [staging](https://github.com/crystalcheong/homey/tree/staging) | <a href="https://homey-beta.vercel.app/" target="_blank">https://homey-beta.vercel.app/</a> |

#### 🛠️ Installation and Set Up

- Clone repository

  ```
  git clone git@github.com:crystalcheong/homey.git
  ```

- Install dependencies

  - PNPM
    ```
    pnpm install
    ```

   <details>
  <summary>📦 Other package managers</summary>
  <br/>

  - NPM

  ```
  npm install
  ```

   <br/> 
   
   - Yarn
   
  ```
  yarn install
   ```
   <br/>

   </details>

- Environment Variables
  - Duplicate `.env.example` to create `*.env` files
    - `.env` — The default file used to store your dev, production, and test variables
    - `.env.local` — Overrides all environment files except the test file (including the default .env file)
- Preparing Prisma

  ```
   pnpm prisma:update
   pnpm prisma:prepare
  ```

- Starting the application
  - The application will start at `http://localhost:3000` by default
    ```
     pnpm dev
    ```

---

<details>
<summary>📂 Project Structure</summary>
<br/>
  
```
📦homey-webapp
 ┣ 📂prisma
 ┣ 📂public
 ┣ 📂src
 ┃ ┣ 📂components
 ┃ ┣ 📂pages
 ┃ ┣ 📂styles
 ┃ ┣ 📂utils
 ┣ 📂tests
 ┣ 📜README.md
 ```

[`/prisma`](./prisma) - contains the Prisma schema and migrations<br/>
[`/public`](./public) - stores static assets such as images, fonts, etc<br/>
[`/src`](./src) - contains the source code of the application, segmented into different subfolders such as components, pages, styles, etc<br/>
[`/src/components`](./src/components) - contains reusable UI components that are used across the application, such as buttons, forms, and navigation bars <br/>
[`/src/pages`](./src/pages) - each file in this directory represents a route in the application and is responsible for rendering the content of that route <br/>
[`/src/styles`](./src/styles) - stores global styles that are used across the entire application. <br/>
[`/src/utils`](./src/utils) - contains helper functions and utilities that are used across the application.<br/>
[`/lib`](./lib) - contains the project dependencies<br/>
[`/tests`](./tests) - contains end-to-end test scripts and result logging<br/>

 </details>

---

#### 🧰 Languages & Tools

- Languages & Frameworks<br/>
  <img alt="Typescript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" height="25"/>
  <img alt="NextJS" src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" height="25"/>

- Tools, IDE <br/>
  <img alt="Github" src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" height="25"/>
  <img alt="Github Actions" src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" height="25"/>
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" height="25"/>
  <img alt="Vercel" src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" height="25"/>

---

#### Contributors ✨

<table>
  <tr>
    <td align="center"><a href="https://github.com/crystalcheong"  target="_blank"><img src="https://avatars.githubusercontent.com/u/65748007?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Crystal Cheong</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/minghancmh" target="_blank"><img src="https://avatars.githubusercontent.com/u/92656699?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chan Ming Han</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/murong2602" target="_blank"><img src="https://avatars.githubusercontent.com/u/105585164?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ng Mu Rong</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/junkoon" target="_blank"><img src="https://avatars.githubusercontent.com/u/38901349?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ang Jun Koon</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/ChiHian" target="_blank"><img src="https://avatars.githubusercontent.com/u/115488816?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cheong Chi Hian</b></sub></a><br /></td>
  </tr>
</table>

---

_This repository is submitted as a project work for Nanyang Technological University's [SC2006 - Software Engineering course](https://www.nanyangmods.com/modules/cz2006-software-engineering-3-0-au/)._
