/* global */
const providerList: HTMLElement = helper.getElement('.providerList')

type Provider = {
  id?: string
  name: string
  service: string
  keys: ProviderKey[]
  domains: Domain[]
}

type ProviderKey = {
  id?: string
  service?: string
  value?: string
  key: string
}

type Domain = {
  domain: string
  expires?: string
  provider?: string
}

class DomainElement {
  constructor(
    domainObj: Domain,
    domainService: string,
    availableDomains: Domain[],
    container: HTMLElement
  ) {
    const domainElement = document.createElement('div')
    const foundDomain = availableDomains.find((e) => e.domain === domainObj.domain)
    const checkDomain = foundDomain
      ? '<i class="fa fa-check-circle" style="color:green"></i>'
      : ''
    const isSetup = foundDomain ? 'Reconfigure' : 'Setup'
    const setUpButtonClass = isSetup === 'Reconfigure' ? 'btn-danger' : 'btn-primary'
    domainElement.innerHTML = `
      <div class="row">
        <div class="col-10">
          <span class="domainElement">${domainObj.domain}</span>
          ${checkDomain}
        </div>
        <div class="col-2" style="display:flex; align-items:right; justify-content:right">
          <button type="button" class="btn ${setUpButtonClass} setUpButton">${isSetup}</button>
        </div>
      </div>
    `
    domainElement.classList.add('list-group-item')
    const setUpButton = helper.getElement('.setUpButton', domainElement)
    setUpButton.onclick = (): void => {
      fetch('/api/admin/sslCerts', {
        method: 'POST',
        body: JSON.stringify({
          service: domainService,
          selectedDomain: domainObj.domain
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(() => {
          window.location.reload()
        })
    }
    container.appendChild(domainElement)
  }
}

class ProviderKeyElement {
  constructor(
    providerKey: ProviderKey,
    providerId: string,
    providerKeysContainer: HTMLElement
  ) {
    const providerKeyElement = document.createElement('div')
    const isNew = !providerKey.id
    const buttonText = isNew ? 'Create' : 'Update'
    providerKeyElement.innerHTML = `
      <div class="row">
        <div class="col-10">
          <span class="providerKeyName">${providerKey.key}</span>
          <input type="text" value="${providerKey.value ||
              ''}" class="keyInput"></input>
          </div>
        <div class="col-2" style="display:flex; align-items:right; justify-content:right">
          <button type="button" class="btn btn-primary createOrUpdateButton">${buttonText}</button>
      </div>
    `
    providerKeyElement.className = 'list-group-item'
    const createOrUpdate = helper.getElement(
      '.createOrUpdateButton',
      providerKeyElement
    )
    createOrUpdate.onclick = (): void => {
      const keyInput = helper.getElement(
        '.keyInput',
        providerKeyElement
      ) as HTMLInputElement
      const method = isNew ? 'POST' : 'PATCH'
      fetch(`/api/admin/providerKeys/${providerKey.id || ''}`, {
        method,
        body: JSON.stringify({
          key: providerKey.key,
          value: keyInput.value,
          service: providerId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => window.location.reload())
    }
    providerKeysContainer.appendChild(providerKeyElement)
  }
}

class ProviderElement {
  constructor(providerId: string, provider: Provider) {
    const providerContainer = document.createElement('div')
    providerContainer.innerHTML = `
        <h3>${provider.name}</h4>
        <ul class="list-group-item">
          <div class="providerKeysContainer"></div>
          <hr />
          <h4>Domains</h4>
          <ul class="domainList list-group"></ul>
        </ul>
      `
    const providerKeysContainer = helper.getElement(
      '.providerKeysContainer',
      providerContainer
    )
    const domainListContainer = helper.getElement(
      '.domainList',
      providerContainer
    )
    provider.keys.map((providerKey: ProviderKey) => {
      return new ProviderKeyElement(
        providerKey,
        providerId,
        providerKeysContainer
      )
    })
    fetch('/api/availableDomains')
      .then(res => res.json())
      .then((availableDomains) => {
        provider.domains.map(domain => {
          return new DomainElement(domain, providerId, availableDomains, domainListContainer)
        })
      })
    providerList.appendChild(providerContainer)
  }
}

fetch('/api/admin/providers')
  .then(res => res.json())
  .then(providerList => {
    providerList.map((provider: Provider) => {
      const providerId = provider.id || ''
      return new ProviderElement(providerId, provider)
    })
  })
