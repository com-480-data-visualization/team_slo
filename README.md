# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Vincent Roduit | 325140|
| Yannis Laaroussi| 369854|
| Fabio Palmisano| 296708 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (29th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

**Olympic Summer & Winter Games**

This [dataset](https://www.kaggle.com/datasets/piterfm/olympic-games-medals-19862018/data) is a comprehensive historical record of the Olympic Games, spanning from 1896 to 2022. It encompasses detailed statistics on medals, athletes, and host countries. With over 21,000 medals, 162,000 results, 74,000 athletes, 20,000 biographies, and data on 53 hosts of both the Summer and Winter Olympic Games, it provides a rich resource for analysis and exploration.

### Problematic

Accessing comprehensive information about Olympic Games results and host countries can be challenging. This project aims to address this issue by creating a centralized platform offering in-depth insights into the Olympic Games. The envisioned platform will feature a dynamic world map interface, allowing users to explore various statistics such as hosting countries and medal counts. By clicking on a specific country, users can delve into the country awards as well as the detailed profiles of top athletes from that country, along with their corresponding medal counts.

### Exploratory Data Analysis

The exploratory analysis was conducted using Python, with the findings summarized in a Jupyter Notebook available at `src/data_preprocessing.ipynb`. These analyses have revealed promising insights that lay the groundwork for the envisioned visualizations described in the previous section.

### Related work

Other related work are already on the website of the dataset focusing on some initial analysis (e.g. [Olympic Games 1986-2022, Data Visualization](https://www.kaggle.com/code/piterfm/olympic-games-1986-2022-data-visualization#How-is-data-look-like?) and [Olympic Games EDA](https://www.kaggle.com/code/kalilurrahman/olympic-games-eda)). A very interesting visulation which inspired us came from these websites: [How to visualize the Olympics ](https://flourish.studio/blog/visualizing-olympics/) and [120 years of Olympics Games](https://towardsdatascience.com/120-years-of-olympic-games-56411bc4bd53). These visualizations appear to be well designed for users and shows proper ways to represent the data. As the core idea is mainly focus on developing an interactive map, we found these interesting works: [Visited places](https://visitedplaces.com/), [Sustainable Development Report](https://dashboards.sdgindex.org/map)
which illustrated how powerful the visualisation on map can be.
Our project introduces a novel approach that sets it apart from other related works by providing comprehensive access to all statistics concerning the Olympic Games in a single interface. By visualizing this data on a world map, we enhance user-friendliness, offering a unique and superior experience compared to existing works.


## Milestone 2 (26th April, 5pm)

**10% of the final grade**

[Website for Milestone 2](https://com-480-data-visualization.github.io/team_slo) \
[Link to the report](./documents/data_visualization_m2_report.pdf)

## Milestone 3 (31st May, 5pm)

**80% of the final grade**

[Website for Milestone 3](https://com-480-data-visualization.github.io/team_slo) \
[Link to the Process Book](./documents/data_visualization_m3_report.pdf) \
[Link to Screencast](./document/data_visualization_m3.mp4)

### Project Structure
```
.
├── README.md
├── data
│   ├── image_athletes
│   ├── olympic_athletes.csv
│   ├── olympic_hosts.csv
│   ├── olympic_hosts_processed.csv
│   ├── olympic_medals.csv
│   ├── olympic_medals_join.csv
│   ├── olympic_medals_processed.csv
│   ├── olympic_results.csv
│   ├── olympic_results.pkl
│   ├── olympic_results_join.csv
│   ├── olympic_top_athlete_per_country.csv
│   ├── olympic_treemap_country_list.csv
│   ├── olympic_treemap_discipline.csv
│   ├── olympic_treemap_event.csv
│   └── world_map.json
├── documents
│   ├── data_visualization_m2_report.pdf
│   ├── data_visualization_milestone1.pdf
│   └── data_visualization_milestone2.pdf
│   └── data_visualization_m3_report.pdf
│   └── data_visualization_m3.mp4
├── index.html
└── src
    ├── processing
    │   └── data_preprocessing_Fabio.ipynb
    ├── test
    │   ├── draw_treemap.js
    │   ├── fetch_data.js
    │   ├── test.css
    │   ├── test.html
    │   └── test.js
    └── website
        ├── about.html
        ├── css
        │   ├── about.css
        │   ├── main.css
        │   ├── popup.css
        │   ├── snowflakes.css
        │   ├── statistics.css
        │   ├── switch.css
        │   ├── treemap.css
        │   └── world_map.css
        ├── flare-2.json
        ├── js
        │   ├── snowflakes.js
        │   ├── statistics.js
        │   ├── switch.js
        │   ├── treemap
        │   │   ├── draw_treemap.js
        │   │   ├── fetch_data.js
        │   │   ├── popup.js
        │   │   └── treemap.js
        │   └── world_map.js
        ├── pictures
        ├── statistics.html
        └── world_map.html
```

