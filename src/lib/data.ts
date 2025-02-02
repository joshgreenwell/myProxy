import fs from 'fs'
import { createDomainCache, createIdCache } from '../helpers/cache'
import { DB, ServiceKey } from '../types/admin'
import { Mapping, MappingObj, Domain } from '../types/general'

const data: DB = {
  serviceKeys: [],
  mappings: [],
  availableDomains: []
}

let domainToMapping: MappingObj | {} = {}
let idToMapping: MappingObj | {} = {}

const updateCache = (table: string): void => {
  if (table === 'mappings') {
    domainToMapping = createDomainCache(data.mappings)
    idToMapping = createIdCache(data.mappings)
  }
}

fs.readFile('./data.db', (err, file) => {
  if (err) {
    return console.log(
      'File does not exist, but do not worry. File will be created on first save',
      err
    )
  }
  const fileData: DB = JSON.parse(file.toString() || '{}')
  data.serviceKeys = fileData.serviceKeys || []
  data.mappings = fileData.mappings || []
  data.availableDomains = fileData.availableDomains || []

  domainToMapping = createDomainCache(data.mappings)
  idToMapping = createIdCache(data.mappings)
})

// Typescript disable, because this is meant as a helper function to be used with N number of input types
const getData = (table: string): unknown => {
  return data[table]
}

// Typescript disable, because this is meant as a helper function to be used with N number of input types
const setData = (table: string, records: unknown): void => {
  data[table] = records
  updateCache(table)

  const fileData = `${JSON.stringify(data, null, 2)}`

  fs.writeFile('./data.db', fileData, err => {
    if (err) {
      return console.log('writing to DB failed', err)
    }
    console.log('successfully wrote to DB')

    // The line below needs to be here. For some reason,
    // data[table] value seems to be an old value and
    // does not take the records value. Strange.
    data[table] = records
    updateCache(table)
  })
}

const getProviderKeys = (): ServiceKey[] => {
  const initialData = getData('serviceKeys') as ServiceKey[] | undefined
  return initialData || []
}

const getMappings = (): Mapping[] => {
  const initialData = getData('mappings') as Mapping[] | undefined
  return initialData || []
}

const getAvailableDomains = (): Domain[] => {
  const initialData = getData('availableDomains') as Domain[] | undefined
  return initialData || []
}

const getMappingByDomain = (domain: string): Mapping => {
  return domainToMapping[domain]
}

const getMappingById = (id: string): Mapping => {
  return idToMapping[id]
}

const deleteDomain = (domain: string): void => {
  delete domainToMapping[domain]
  setData('mappings', Object.values(domainToMapping))
}

export {
  getData,
  setData,
  getProviderKeys,
  getMappings,
  getAvailableDomains,
  getMappingByDomain,
  getMappingById,
  deleteDomain
}
