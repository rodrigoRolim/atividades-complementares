class DocumentController {
  // pusher going to here
  constructor (Document, path, fs, subscription) {

    this.Document = Document
    this.path = path
    this.fs = fs
    this.subscription = subscription
  }
  create (req, res) {

    const docJson = JSON.parse(req.body.document)
    docJson.path = req.file.path // change for filename
    const document = new this.Document(docJson)
    return document.save()
      .then(() => res.status(201).send(document))
      .catch((err) => res.status(422).send(err.message)) 
  }
  delete (req, res) {
    const file = this.path.join('uploads', req.params.file)
    return this.Document.remove({ path: file, sent: false })
      .then(() => {
        
        const pathname = this.path.join(__dirname, '..', '..', 'uploads', req.params.file)
        this.fs.unlink(pathname)
          .then(() => res.sendStatus(204))
          .catch((err) => res.status(404).send(err.message))
      })
      .catch((err) => res.status(400).send(err.message))
  }
  readAll (req, res) {

    return this.Document.find({ student: req.params.id })
      .then((documents) => res.send(documents))
      .catch((err) => res.status(400).send(err.message))
  }
  readAllSents (req, res) {

    return this.Document.find({ student: req.params.id, sent: true })
      .then((documents) => res.send(documents))
      .catch((err) => res.status(400).send(err.message))
  }
  getFile (req, res) {

    const fileLocation = this.path.join(__dirname, '..', '..', 'uploads', req.params.file)

    return this.fs.access(fileLocation, this.fs.F_OK)
      .then(() => res.sendFile(fileLocation))
      .catch((err) => res.status(400).send(err.message))
  }
  getById (req, res) {

    const { params : { id } } = req

    return this.Document.find({ _id: id })
      .then((document) => res.send(document))
      .catch((err) => res.status(400).send(err.message))
  }
  update (req, res) {
    // extrair id de student em document e usar no canal
    const { params: { id } } = req
    console.log(id)
    return this.Document.findOneAndUpdate({ _id: id }, req.body, { returnNewDocument: true })
      .then((doc) => {
        this.subscription.recalculeScore(doc.student, { id: req.body._id, evaluation: req.body.evaluation })
        res.send(doc)
      })
      .catch((err) => res.status(422).send(err.message))
  }
  sent (req, res) {
    // pusher: o canal o usado é o id de estudante
    return this.Document.updateMany({ student: req.params.id, $or: [ { sent: true }, { sent: false } ], 
      evaluation: { $not: /aproved/ } }, { $set: { evaluation: 'none', sent: true } })
      .then(() => {
        // this.subscription.sendStudent(req.params.id)
        res.sendStatus(200)
      })  
      .catch((err) => res.status(400).send(err.message))
  }
}

export default DocumentController


