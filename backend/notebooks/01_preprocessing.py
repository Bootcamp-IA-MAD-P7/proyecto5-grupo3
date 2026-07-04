# ---
# jupyter:
#   jupytext:
#     cell_metadata_filter: title,-all
#     formats: py:percent,ipynb
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.19.4
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %% [markdown]
# ## Classification project — Starter EDA

# %% 1. Imports
import pandas as pd
import numpy as np
import kagglehub
import os
import re

import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (12, 5)

# %% 2. Load data
path = kagglehub.dataset_download("yeanzc/telco-customer-churn-ibm-dataset")
print("Path to dataset files:", path)
df = pd.read_excel(os.path.join(path, 'Telco_customer_churn.xlsx'))
df.head(5)

# %%
df.info()

# %%
df.tail(30)

# %%
