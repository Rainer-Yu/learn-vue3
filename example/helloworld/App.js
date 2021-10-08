import { h } from '../../lib/mini-vue3.esm.js'
export const App = {
    setup() {
        return {
            msg: 'mini-vue'
        }
    },
    render() {
        return h(
            'div',
            {
                class: ['bold'],
                id: 'root'
            },
            [
                h('span', { class: 'red' }, 'hi '),
                h('span', { class: 'blue' }, 'mini-vue3')
            ]
        )
    }
}
