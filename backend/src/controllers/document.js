class DocumentController {
  constructor (Document, path, fs) {
    this.Document = Document
    this.path = path
    this.fs = fs
  }
  create (req, res) {

    console.log(req.file)
    const docJson = JSON.parse(req.body.document)
    docJson.path = req.file.path // change for filename
    const document = new this.Document(docJson)
    return document.save()
      .then(() => res.status(201).send(document))
      .catch((err) => res.status(422).send(err.message)) 
  }
  delete (req, res) {
    console.log(req)
    return this.Document.remove({ path: req.params.file })
      .then(() => {
        this.fs.unlink(req.params.file)
          .then(() => res.sendStatus(204))
          .catch((err) => {
            console.log(err.message)
            res.status(404).send(err.message)
          })
          console.log('aqui')
      })
      .catch((err) => res.status(400).send(err.message))
  }
  readAll (req, res) {

    return this.Document.find({})
      .then((documents) => res.send(documents))
      .catch((err) => res.status(400).send(err.message))
  }
  // implementar a rota dessa função
  getFile (req, res) {
    console.log(req.params.file)

    const fileLocation = this.path.join(__dirname, '..', '..', req.params.file)
    return this.fs.access(fileLocation, this.fs.F_OK)
      .then(() => res.sendFile(fileLocation))
      .catch((err) => res.status(400).send(err.message))
  }
 
}

export default DocumentController
