const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const Multer = require('multer')
const imgUpload = require('../modules/imgUpload')

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
})

// TODO: Sesuaikan konfigurasi database
const connection = mysql.createConnection({
    host: 'public_ip_sql_instance_Anda',
    user: 'root',
    database: 'nama_database_Anda',
    password: 'password_sql_Anda'
})

router.get("/getrecords", (req, res) => {
    const query = "SELECT * FROM records"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

router.get("/getrecord/:id", (req, res) => {
    const id = req.params.id

    const query = "SELECT * FROM records WHERE id = ?"
    connection.query(query, [id], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

router.post("/insertrecord", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
    const title = req.body.title
    const description = req.body.description
    var imageUrl = ''

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }

    const query = "INSERT INTO records (title, description, attachment) values (?, ?, ?, ?, ?)"

    connection.query(query, [title, description, imageUrl], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Insert Successful"})
        }
    })
})

router.put("/editrecord/:id", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
    const id = req.params.id
    const title = req.body.title
    const description = req.body.description
    var imageUrl = ''

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }

    const query = "UPDATE records SET title = ?, description = ?, attachment = ? WHERE id = ?"
    
    connection.query(query, [title, description, imageUrl, id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Update Successful"})
        }
    })
})

router.delete("/deleterecord/:id", (req, res) => {
    const id = req.params.id
    
    const query = "DELETE FROM records WHERE id = ?"
    connection.query(query, [id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Delete successful"})
        }
    })
})

router.post("/uploadImage", multer.single('image'), imgUpload.uploadToGcs, (req, res, next) => {
    const data = req.body
    if (req.file && req.file.cloudStoragePublicUrl) {
        data.imageUrl = req.file.cloudStoragePublicUrl
    }

    res.send(data)
})

module.exports = router
