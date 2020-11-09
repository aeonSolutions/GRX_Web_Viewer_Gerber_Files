# GRX

Gerber Viewer with 3d support and beautiful finished board rendering

#### !! DEVELOPMENT !!

![homepage](/frontend/public/GIFs/full.gif)

## About

Front-End & Back-End Repository for GRX.

Front end is a single-page React App that utilizes advanced libraries including Three.js and TraceSpace. These combined create an awesome 3D gerber viewer.

## For All-In-One Production

### Install Dependencies

Install dependencies for both frontend and backend

### Edit .env files for each side

Frontend `/frontend/.env`
Backend `/backend/.env`

### Build Frontend into Production

In `/frontend` run `npm run build`

#### Install pm2

```
npm install pm2 -g
```

#### Start pm2

```
pm2 start pm2.config.json
```
