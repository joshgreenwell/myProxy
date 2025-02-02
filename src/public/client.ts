/* global helper */
type Mapping = {
  domain: string
  subDomain: string
  ip: string
  port: string
  id: string
  gitLink: string
  fullDomain: string
  status?: string
}

type Status = {
  fullDomain: string
  status: string
}

const create: HTMLElement = helper.getElement('.create')
const hostSelector: HTMLElement = helper.getElement('#hostSelector')
const domainList: HTMLElement = helper.getElement('.domainList')
const dropDownDomains: HTMLElement = helper.getElement('.dropdown-menu')
let selectedHost = ''

// eslint-disable-next-line
class DomainOption {
  constructor(domain: string) {
    const dropdownElement = document.createElement('button')
    dropdownElement.classList.add('dropdown-item')
    dropdownElement.textContent = domain
    dropdownElement.onclick = (): void => {
      hostSelector.innerText = domain
      selectedHost = domain
    }

    dropDownDomains.appendChild(dropdownElement)
  }
}

class MappingItem {
  constructor(data: Mapping) {
    const mappingElement = document.createElement('li')
    let iconClass
    let iconColor
    if (data.status === 'online') {
      iconClass = 'fa fa-circle mr-1 mt-1'
      iconColor = 'rgba(50,255,50,0.5)'
    } else if (data.status === 'not started') {
      iconClass = ''
      iconColor = 'transparent'
    } else {
      iconClass = 'fa fa-circle mr-1 mt-1'
      iconColor = 'rgba(255, 50, 50, 0.5)'
    }
    mappingElement.classList.add(
      'list-group-item',
      'd-flex',
      'align-items-center'
    )
    domainList.appendChild(mappingElement)
    mappingElement.innerHTML = `
      <div style='width: 100%'>
        <div style='display: flex'>
          <i class="${iconClass}" style="font-size: 15px; color: ${iconColor}"></i>
          <a class="font-weight-bold"
            href="https://${data.fullDomain}">
            ${data.fullDomain}
          </a>
          <small class="form-text text-muted ml-1">
            PORT: ${data.port}
          </small>
        </div>
        <small class="form-text text-muted" style="display: inline-block;">
          ${data.gitLink}
        </small>
      </div>
      <a href="/api/mappings/download/?fullDomain=${data.fullDomain}"
	      target="_blank" class="btn btn-sm btn-outline-success mr-3">
	      Download<i class="fa fa-download"></i>
      </a>
      <button
        class="btn btn-sm btn-outline-danger mr-3 deleteButton"
        type="button">
          Delete
      </button>
    `

    const delButton = helper.getElement('.deleteButton', mappingElement)
    delButton.onclick = (): void => {
      if (confirm('Are you sure want to delete this domain?')) {
        fetch(`/api/mappings/${data.id}`, {
          method: 'DELETE',
          body: JSON.stringify({ data }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(() => {
          window.location.reload()
        })
      }
    }
  }
}

fetch('/api/mappings')
  .then(r => r.json())
  .then(mappings => {
    domainList.innerHTML = ''
    mappings
      .reverse()
      .filter(
        e => e.domain && e.port && e.id && e.gitLink && e.fullDomain && e.status
      )
      .forEach(e => {
        new MappingItem(e)
      })
  })

create.onclick = (): void => {
  const subDomain = helper.getElement('.subDomain') as HTMLInputElement
  const port = helper.getElement('.port') as HTMLInputElement
  const ipAddress = helper.getElement('.ipAddress') as HTMLInputElement
  const portValue = port.value
  const domain = selectedHost
  const ipValue = ipAddress.value
  const subDomainValue = subDomain.value

  fetch('/api/mappings', {
    method: 'POST',
    body: JSON.stringify({
      domain: domain,
      subDomain: subDomainValue,
      port: portValue,
      ip: ipValue
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.status === 400) {
      return res.json().then(response => {
        alert(response.message)
      })
    }
    window.location.reload()
  })
  port.value = ''
  ipAddress.value = ''
  subDomain.value = ''
}

fetch('/api/availableDomains')
  .then(r => r.json())
  .then((data: Mapping[]) => {
    const domains = data.map(el => el.domain).sort()
    domains.forEach(domain => new DomainOption(domain))
    selectedHost = domains[0]
    hostSelector.innerText = domains[0]
  })
