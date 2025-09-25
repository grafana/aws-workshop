---
---

# 1.2. Tour of Grafana Cloud

During the course of this workshop, you'll be observing applications in an AWS environment, which uses various AWS services, like:

- Lambda
- EC2
- Elastic Container Service (ECS)
- SQS
- RDS

In this first lab, we'll explore the Grafana Cloud UI, and get familiar with its key features.

## Step 1: Observe application performance

Grafana Cloud builds easy-to-use solutions on top of your telemetry signals, for easy correlation and faster root cause analysis.

When you want to get a single picture of the health of your applications on AWS, you can use **Grafana Cloud Application Observability**.

:::opentelemetry-tip

*Application Observability* is designed from the ground up to fully support OpenTelemetry. It allows you to monitor application health, group by specific attributes, and slice and dice your data in many ways.

:::

Let's take a look at our applications in this environment:

1.  Navigate to **Observability -> Application** in the left-hand menu.

1.  This will take you to the **Service Inventory** page, where you can see all your OpenTelemetry-instrumented services.

    Notice how the Service Inventory automatically detects your runtime languages and detects your AWS resources (denoted by the AWS icon).

1.  Click on the **tickets-server** service to view detailed metrics, logs, and traces for that service.

1.  In the main view, we see Request Rate, Error Rate, and Latency for the service.

    The **P95** latency is shown in the top right corner, which means that 95% of requests are served within this time. This is a key metric for understanding the performance of your service. 

1.  By **Group by**, click on **cloud.availability_zone**. Now we can see the distribution of our requests across each AWS availability zone.

    This could help us to troubleshoot problems in a particular AWS availability zone, for example.

1.  Click on the **Traces** tab.

1.  Click on a trace to see detected process, ECS task name, cloud region, and other attributes.

    These are attributes that are detected by our OpenTelemetry instrumentation and can give us rich context to help us correlate or filter signals.


## Step 2: Observe AWS infrastructure

The Grafana Cloud **AWS Observability app** provides a comprehensive view of your AWS infrastructure, including resources like EC2 and RDS instances.

First we'll take a look at how it's configured, then we will look at the built-in dashboards and alerts.

1.  Click on **Observability -> Cloud provider -> AWS**.

1.  Click on **Configuration -> CloudWatch metrics scrape**.

    - We've already created a scrape job for you. Click on it to see how it's configured.

    - The scrape job fetches CloudWatch metrics from AWS and brings them into your Grafana instance.

1.  Return back to the Cloud Provider -> AWS screen. Click on **AWS/RDS** to show the RDS dashboard.

    - Scroll down to see the database instances in this AWS Account, CPU utilization and other statistics. 

    - Click on a database instance to see its metrics.

1.  Finally, return back to the Cloud Provider -> AWS screen, and click on the **Alerts** tab. These pre-installed, opinionated alerts help you understand when things are going wrong in your infrastructure. 

    :::note

    You can optionally install these alerts when you configure the AWS integration. In this environment, we have installed the alerts for you.

    :::

You can use the Cloud Provider Observability app in Grafana Cloud to monitor all your core AWS services, like EC2, Lambda and RDS.

:::aws-tip[AWS Integration vs. Direct Query]

The AWS integration (what we're using here) pulls your CloudWatch metrics into Grafana Cloud, giving you faster queries, pre-built dashboards, and the full AWS Observability app experience. Alternatively, you can use the [CloudWatch data source](https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/) to query CloudWatch directly - this keeps your data in AWS but you'll miss out on the full AWS Observability app experience.

:::

## Step 3: Explore the underlying telemetry

Underneath Grafana Cloud, all of your telemetry data is stored in our open source telemetry backends. Whenever you want to explore signals directly, you can use the Drilldown apps.

So let's explore some telemetry signals! We've already configured some of our applications to send **traces** to Grafana Cloud.

1.  Navigate to **Drilldown** from the side menu, then click on **Traces**.

    :::opentelemetry-tip
    Drilldown Traces provides a powerful way to view and analyze distributed traces. We collect these with **OpenTelemetry** instrumentation. This allows us to see the flow of requests through our application, and how they are affected by different services along the way.
    :::

1.  The default view shows the rate of all traces, labelled as the **span rate**. Click on the **Errors rate** panel (_"errors/s"_) at the top to switch the view to show spans with errors.

    If your application has any errored spans, they will be shown here. This can help you instantly identify issues in your application.

1.  Click on the **duration** panel to switch the view to show a histogram of span durations.

    This view allows you to see typical durations of all of the requests flowing through your system. You can use this to:
    
    - find slow interactions
    - quickly find outliers.

1.  This view is showing all of our instrumented services. Let's zoom in a little and just find all **ECS** services.

    Using the filter panel (_"Filter by label values"_) at the top of the page, add a filter:

    **resource.cloud.platform** = **aws_ecs**

    Now we can see only traces from our AWS ECS tasks: tickets-requester, and tickets-server.

:::aws-tip

If you've used AWS X-Ray before, this might feel familiar! We can see request flows across services, allowing us to observe a single request as it touches multiple AWS services. The key difference in this setup is that we're storing traces in Grafana Cloud Traces. This allows you to correlate traces across your hybrid and multi-cloud environments, and seamlessly correlate with your metrics and logs.

If you want to query your X-Ray traces in Grafana directly, you can also do that using the [AWS Application Signals data source](https://grafana.com/grafana/plugins/grafana-x-ray-datasource/).

:::



## Step 4: Connect your data, wherever it lives

Grafana Cloud allows you to bring your data, wherever it lives, even if it's in a private environment, using **Private Data Source Connect**.

Let's test this out by connecting to our application's RDS database.

1.  From the side menu, navigate to **Connections > Data sources**

1.  Open the **tickets-db** data source.

1.  Scroll to the bottom of the page and note that we're using Private Datasource Connect, which allows us to connect to data sources anywhere, even if they are in private networks.

    :::info

    We have already configured Private Data Source Connect for you here, but if you want to configure it in your own environment, you can read more about it here:
    
    https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/ 

    :::

1.  Now let's run a database query on our RDS database instance. From the top of the data source edit page, click on the **Explore data** button. 

    OR, from the side menu navigate to **Explore** and then select the **tickets-db** data source.

1.  Switch to **Code** view, then type the following SQL statement:

    ```
    SELECT COUNT(*) FROM booking;
    ```

1.  We have a successful connection to our RDS instance! We can now use this to correlate real data in Grafana.


## Wrapping Up

In this lab, you learned how to:

- Navigate the Grafana Cloud UI

- Understand Application Observability 

- Understand how to connect your data, wherever it lives, using data sources and Private Data Source connect

Click **Next** to continue to the next module.
