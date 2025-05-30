---
sidebar_position: 2
---

# 1.2. Tour of Grafana Cloud

In this lab, we'll explore the Grafana Cloud UI, and you'll get familiar with its key features.

## Step 1: Get the lay of the land

1.  **Let's explore some telemetry signals!** We've already configured some applications to send traces to Grafana Cloud.

    Navigate to **Drilldown** from the side menu, then click on **Traces**.

1.  Drilldown Traces provides a powerful way to view and analyze traces collected, allowing you to see the flow of requests through your application, and how they are affected by different services along the way.

1.  The default view shows the rate of all traces. Click on the **Errors rate** panel at the top to switch the view to showing traces with errors.

    Now the view shows traces that have errors, which can help you identify issues in your application.

## Step 2: Observe your applications

Grafana Cloud brings powerful solutions on top of your telemetry signals, for easier correlation and faster root cause analysis.

When you want to get a single picture of the health of your applications, you can use **Grafana Cloud Application Observability**.

:::opentelemetry-tip

Application Observability is designed from the ground up to fully support OpenTelemetry. It allows you to monitor application health, group by attributes, and slice and dice your data in many ways.

:::

1.  Navigate to **Observability -> Application** in the left-hand menu.

1.  This will take you to the **Service Inventory** page, where you can see all your OpenTelemetry-instrumented services.

1.  Click on the **mythical-server** service to view detailed metrics, logs, and traces for that service.

1.  In the main view, we see Request Rate, Error Rate, and Latency for the service.

    The **P95** latency is shown in the top right corner, which means that 95% of requests are served within this time. This is a key metric for understanding the performance of your service. 

1.  Click into a trace to see detected process, ECS task name, cloud region, and other attributes.


## Step 3: Observe AWS infrastructure

The Grafana Cloud **AWS Observability app** provides a comprehensive view of your AWS infrastructure, including EC2 instances and RDS databases.

1.  Click on Configuration > Scrape jobs.

    - We've already created a scrape job for you

    - This fetches CloudWatch metrics from AWS and brings them into your Grafana instance.

1.  Since we are bringing CloudWatch metrics into Grafana, click on the Alerts tab to see some prepopulated alerts, which will help you make sense of your infrastructure. Grafana automatically creates for you when you set up the integration.

1.  Click on the Dashboards tab to see out-of-the-box dashboards with metrics and information from your AWS services

You can use this app to monitor many different core AWS services, like EC2, Lambda and RDS.

:::tip

For any services which you're unable to instrument directly with OpenTelemetry, you can use the CloudWatch data source to bring in metrics and logs. This means you can correlate across services and boundaries, across almost any AWS service.

Learn more about the CloudWatch data source.

:::


## Step 4: Connect your data, wherever it lives

Grafana allows you to bring your data, wherever it lives. Even if it's in a private environment.

- Notice how we've connected our database here so we can use it with the Postgresql data source

- Configure a simple Private Data Source connect data source (RDS database?)

- We can also leverage AWS Private Link on our telemetry collectors, to save data egress costs, keeping everything entirely within AWS


## Wrapping Up

In this lab, you learned how to:

- Navigate the Grafana Cloud UI

- Understand Application Observability 

- Understand how to connect your data, wherever it lives

Click **Next** to continue to the next module.
