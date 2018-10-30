const aws = require('aws-sdk')
const restify = require('restify')
const HttpStatus = require('http-status-codes')
const server = restify.createServer()

aws.config
  .loadFromPath('./config/config.json')

server
  .use(restify.plugins.bodyParser({ mapParams: true }))
  .use(restify.plugins.queryParser({ mapParams: true }))
  .use(restify.plugins.acceptParser(server.acceptable))

let array = []
const env = require('./config/environments')
const snsInit = new aws.SNS({ apiVersion: '2010-03-31' })

// Controllers
const listarTopicos = (req, res, next) => {
  array = []
  const listar = snsInit
    .listTopics({})
    .promise()

  listar
    .then(data => {
      data.Topics.forEach(element => {
        array.push({
          ARN: element.TopicArn,
          Name: element.TopicArn.split(':').pop(),
        })
      })

      res.send(HttpStatus.OK, array)
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

const criarTopico = (req, res, next) => {
  const criar = snsInit
    .createTopic({ Name: req.body.name })
    .promise()

  criar
    .then(data => {
      res.send(HttpStatus.CREATED, {
        ARN: data.TopicArn,
        Name: data.TopicArn.split(':').pop(),
      })
    })
    .catch(data => {
      console.error(`${error.stack}`)
    })
}

const deletarTopico = (req, res, next) => {
  const deletar = snsInit
    .deleteTopic({ TopicArn: req.params.arn })
    .promise()

  deletar
    .then(data => {
      res.send(HttpStatus.OK, { mensagem: 'Tópico deletado com sucesso.' })
    })
    .catch(error => {
      console.error(`${error.stack}`)
    })
}

// Endpoints
server.get('/', (req, res) => res.send({ mensagem:`Iniciando com AWS SNS.` }))
server.get('/topico', listarTopicos)
server.post('/topico', criarTopico)
server.del('/topico/:arn', deletarTopico)

// Server
server.listen(env.port, () => {
  console.info(`[server.js] - Server running on http://${env.host}:${env.port}`)
})
