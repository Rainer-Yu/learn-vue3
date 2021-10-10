import { h } from '../../lib/mini-vue3.esm.js'
window.self = null
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
                id: 'root'
            },
            [
                h('span', { class: 'red' }, 'hi '),
                h('span', { class: 'blue' }, `"${this.msg}"`)
            ]
        )
    }
}
