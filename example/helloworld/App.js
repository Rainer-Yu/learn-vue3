// import { h } from './vue.runtime.esm-browser.js'
import { h } from '../../lib/mini-vue3.esm.js'
window.self = null
const Foo = {
    setup(props) {
        console.log(props)

        props.count++
        console.log(props)
    },
    render() {
        return h('span', {}, `count: ${this.count}`)
    }
}
export const App = {
    setup() {
        return {
            msg: 'mini-vue'
        }
    },
    render() {
        window.self = this
        return h(
            'div',
            {
                class: ['bold'],
                id: 'root',
                onClick: () => {
                    console.log('click')
                }
            },
            [
                h('span', { class: 'red' }, 'hi '),
                h('span', { class: 'blue' }, `"${this.msg}"`),
                h(Foo, { count: 999 })
            ]
        )
    }
}
