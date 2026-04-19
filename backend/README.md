# Proiect TWEB

### Rulare BE
- `cd backend`
- creat fisier `.env`
- preluare din `.env.example` si adaugat local configurari pentru baza de date MySQL si pentru mailtrap
- `chmod +x start.sh`
- `./start.sh all`:
    - incarca variabilele din .env
    - se asigura ca portul 8080 este liber, daca este nevoie omoara procesele care il folosesc
    - ruleaza migrarile
    - porneste aplicatia
    - porneste swagger

### Rulare FE
- `cd frontend`
- `npm i`
- creat fisier `.env`
- preluat variabila din `.env.example` - url la care ruleaza BE, ar trebui sa fie `http://localhost:8080`
- `npm run dev`