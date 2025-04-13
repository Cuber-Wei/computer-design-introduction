import type {RouteRecordRaw} from 'vue-router'
import Achievements from "../components/AchievementsView.vue";
import ResultsView from "../components/ResultsView.vue";

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: '成果',
        component: Achievements,
    },
    {
        path: '/datasets',
        name: '数据',
        component: ResultsView,
    },
]
