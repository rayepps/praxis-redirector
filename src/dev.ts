import { getFunctionMap, start, lambdaFrameworkMapper } from '@exobase/local'

start({
  port: process.env.PORT,
  framework: lambdaFrameworkMapper,
  functions: getFunctionMap(process.cwd()).map((f) => ({ ...f,
    func: require(f.paths.import).default
  }))
}, (p) => {
  console.log(`API running at http://localhost:${p}`)
})