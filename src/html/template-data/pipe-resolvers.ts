import { Resolver, TemplateData } from './resolver-types.js'

export function pipeResolvers(value: TemplateData, ...resolvers: Resolver<any>[]) {
  for (const resolver of resolvers) {
    const stringResult = resolver(value)

    if (stringResult !== undefined) {
      return stringResult
    }
  }
}