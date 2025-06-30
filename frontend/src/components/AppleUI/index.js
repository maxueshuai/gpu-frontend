import AppleCard from './AppleCard.vue'
import AppleButton from './AppleButton.vue'
import AppleTable from './AppleTable.vue'

const components = [
  AppleCard,
  AppleButton,
  AppleTable
]

const AppleUI = {
  install(app) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}

export {
  AppleCard,
  AppleButton,
  AppleTable
}

export default AppleUI 