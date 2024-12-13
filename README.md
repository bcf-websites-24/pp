<p align="center">
  <img height = "70" width = "70" src="https://github.com/bcf-websites-24/pp/blob/main/static/pp-fest-logo-01.svg" alt= "Picture Puzzle")
</p>

<p align="center"> <h1 align="center"> Picture Puzzle 2024 - BUET CSE FEST </h1> </p>

Here it is, none other than the fan-favourite picture puzzle site of buet cse fest!

## Table of Contents

- [General Info](#general-information)
- [Technologies Used](#main-technologies-used)
- [Features](#features)
- [Demonstration](#demonstration)
- [Setup](#setup)
- [Project Status](#project-status)
- [Room for Improvement](#room-for-improvement)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## General Information

This is the repository of the BUET CSE FEST 2024 picture puzzle website. 

In this linear puzzle solving site, users can -

- sign up after **verifying their email**
- **solve puzzles** with unlimited tries
- see where they stand in **the leaderboard**
- find if **the cheat detector** has flagged them and how much!

On the admin section, there is provision for administrators to -

- **add new** picture puzzle
- see all **latest submissions**
- see all **submissions of an user/a specific puzzle**
- **raise** the highest solvable puzzle **level**
  
## Main Technologies Used

<p align="center">
  <img height="50" width="50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" /> 
  <img height="50" width="50" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/digitalocean/digitalocean-original.svg" /> 
  <img height="50" width="50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" />    
</p>

**Database:**

- Postgresql hosted in DigitalOcean Managed Database

**Unified Backend and Frontend:**

- SvelteKit - version 2.4.3 hosted in DigitalOcean Kubernetes Cluster.

We used **SvelteKit** because we preferred how Kit allowed rapid development with Svelte and we wanted to use a **RESTful API** in the backend, while keeping the codebase for backend and frontend similar. SvelteKit adds useful functions and file based routing while also creating a separate server for the RESTful API.

We chose **DigitalOcean Kubernetes Cluster** for deployment, for we liked how it could give us a very scalable hosting solution, while keeping costs 0(!). DigitalOcean provides some free credits which were enough for hosting all of our BUET CSE FEST websites, including this one.

For managing **email verification** in our project, we used **[a custom mail API server](https://github.com/bcf-websites-24/mail-api)** that Ashraf wrote. For file storage, we used **DigitalOcean Space** to host our files such as puzzle pictures.

## Setup

#### Setting up database

We will provide the sql script for the database soon. When provided you can download and extract the script to setup your database in DigitalOcean or locally, using the `\i <script path>` command of Postgresql to run the SQL script.

#### Clone the repo

In a suitable folder, clone the repo:

`git clone https://github.com/AuthentiDocs/authentidocs.git`

#### Install dependencies

`npm install`

#### Dont forget the .env file

Create a file named `.env.local` and put the needed environment variables:

```
JWT_SECRET=<jwt secret for user password verification>
ADMIN_PWD_HASH=<admin password argon2 hash>
ADMIN_JWT_ID=<admin jwt id>
DB_CONN_STRING=<postgresql connection string
STORAGE_BUCKET_NAME=<digitalocean/other s3 compatible bucket id>
PUBLIC_STORAGE_CDN_ENDPOINT=<digitalocean/other s3 compatible storage cdn link>
STORAGE_ENDPOINT=<digitalocean/other s3 compatible storage bucket link>
STORAGE_ACCESS_KEY=<your access key here>
STORAGE_SECRET=<your storage secret>
MAIL_OTP_ENDPOINT=<mail api server endpoint>
MAIL_API_KEY=<mail api key>

```


#### Running locally

`npm run dev` creates a development server, while `npm run build` will build the project for production that can be viewed with `npm run preview`.

#### Deploying

First, setup your digitalocean infrastructure following this **[excellent repository by Ashraf](https://github.com/bcf-websites-24/k8s-config)**. This will setup necessary kubernetes clusters, load balancers, ingress controllers, metric servers etc. Now, use docker to containerize the site and deploy using github actions. The dockerfiles and action yml files are in the repo for your use.

## Associate Projects

The **[mail API server](https://github.com/bcf-websites-24/mail-api)** has already been mentioned. But the most exciting associate project is the **[Shomiti Detector](https://github.com/bcf-websites-24/somiti-detector)**. Here Ashraf, Sadat, Nafis, Shattik and others used graph algorithms and automated learning to create an awesome cheat detector for the picture puzzle. Not only it catches violations and updates user cheating score, it also finds the answer sharing groups and presents them in a website.

## Project Status

Project is: _not being worked on_ .

## Room for Improvement

Room for improvement:

- Make the admin section login/signup normal, currently it uses one single password for all :3 
- Integrate the shomiti detector viewer with the admin section
- Add provision for showing memes at user section and for managing memes at the admin section

## Acknowledgements

We would like to specially give our heartfelt thanks to our seniors with their excellent picture puzzle sites such as **[CSE 17 Batch](https://github.com/buetcsefest2022/picture-puzzle)** or the **[CSE 14 Batch](https://github.com/ajoydas/CSEfest2019/tree/master/picture_puzzle)** website. Their hardwork and dedication gave us the inspiration to try and emulate the picture puzzle websites of yore. A special shoutout goes to the one and only **[Ataf Fazledin Bhai](https://github.com/fazledyn)**. Bhai kept us on our toes with his rapid solves and clinched the #1 place as usual in the leaderboard. Not only that, he helped us debug some crucial errors at the very onset of the puzzle competitions.

This site would be worthless without the passion and attention of **the puzzle setters**! CSE 19 had a lot of puzzleheads and they all came together to give us the most exciting, most intriguing and often most vexing(!) puzzles. Here goes the honor list, in no particular order:

- Md Raihan Sobhan
- Anindya Hoque
- Md Roqunuzzaman Sojib
- Fahad Ahmed Akash
- Wasif Jalal Galib
- Tanvir Saad
- Rayan Islam
- Labid Al Nahiyan Avro
- Wasif Hamid
- Abir Muhtasim
- Shattik Islam
- Nafis Tahmid
- Asib Rahman
- And yours truly: Ashraf, Siam & Mohaimin

An word or two has to be said about Ashraf. He joined the project late, but as is his forte, he both revamped our deployment also helped us bring about many new features. He is the sole architect behind the excellent Kubernetes infrastructure for BUET CSE FEST 2024. We would like to give him our thanks for helping us out so much.

Finally, we would like show our appreciation for **the organizers and logistics experts** for enabling us with the needed infrastructures and guidance:

- Asif Azad
- Shahriar Raj
- Sadif Ahmed
- Riad Ahmed Anonto
- Sadat Hossain
